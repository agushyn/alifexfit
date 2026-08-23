<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadManagementTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;
    protected Gym $surabayaGym;
    protected User $flagshipAdmin;
    protected User $flagshipStaff;
    protected User $flagshipTrainer;
    protected User $surabayaAdmin;
    protected MembershipPlan $flagshipPlan;
    protected MembershipPlan $surabayaPlan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->flagshipGym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->surabayaGym = Gym::where('code', 'EXF-SBY-02')->firstOrFail();

        $this->flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->firstOrFail();
        $this->flagshipStaff = User::where('email', 'staff.flagship@exfits.com')->firstOrFail();
        $this->surabayaAdmin = User::where('email', 'admin.surabaya@exfits.com')->firstOrFail();

        $this->flagshipTrainer = User::firstOrCreate(['email' => 'trainer.test@exfits.com'], [
            'name' => 'Trainer Test',
            'phone' => '+62 811 0000 0009',
            'password' => bcrypt('password'),
            'status' => 'active',
            'gym_id' => $this->flagshipGym->id,
        ]);
        $this->flagshipTrainer->assignRole('trainer', $this->flagshipGym->id);

        $this->flagshipPlan = MembershipPlan::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->where('status', 'active')->firstOrFail();
        $this->surabayaPlan = MembershipPlan::withoutGymScope()->where('gym_id', $this->surabayaGym->id)->where('status', 'active')->firstOrFail();
    }

    public function test_public_lead_capture_form_renders_successfully(): void
    {
        $response = $this->get(route('public.leads.create', ['gym' => $this->flagshipGym->slug]));

        $response->assertOk();
        $response->assertSee($this->flagshipGym->name);
        $response->assertSee($this->flagshipPlan->name);
    }

    public function test_public_lead_submission_creates_lead_with_new_status_and_website_source(): void
    {
        $response = $this->post(route('public.leads.store', ['gym' => $this->flagshipGym->slug]), [
            'name' => 'Calon Member Baru',
            'phone' => '081299887766',
            'email' => 'calon.member@test.com',
            'whatsapp' => '081299887766',
            'membership_plan_id' => $this->flagshipPlan->id,
            'interest_type' => 'membership',
            'message' => 'Saya ingin tahu promo bulan ini.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $lead = Lead::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('phone', '081299887766')
            ->first();

        $this->assertNotNull($lead);
        $this->assertSame('Calon Member Baru', $lead->name);
        $this->assertSame('calon.member@test.com', $lead->email);
        $this->assertSame('website', $lead->source);
        $this->assertSame('new', $lead->status);
        $this->assertStringStartsWith('LEAD-', $lead->lead_number);

        // Verify Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'gym_id' => $this->flagshipGym->id,
            'action' => 'lead.created',
        ]);
    }

    public function test_duplicate_active_lead_within_same_gym_is_rejected(): void
    {
        // First submission
        $this->post(route('public.leads.store', ['gym' => $this->flagshipGym->slug]), [
            'name' => 'Original Lead',
            'phone' => '081211223344',
            'email' => 'dup.lead@test.com',
        ])->assertSessionHasNoErrors();

        // Duplicate phone submission
        $response = $this->post(route('public.leads.store', ['gym' => $this->flagshipGym->slug]), [
            'name' => 'Duplicate Phone Lead',
            'phone' => '081211223344',
            'email' => 'other.email@test.com',
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_cross_tenant_duplicate_lead_is_allowed(): void
    {
        // Flagship Lead
        $this->post(route('public.leads.store', ['gym' => $this->flagshipGym->slug]), [
            'name' => 'Cross Lead',
            'phone' => '081255667788',
            'email' => 'cross.lead@test.com',
        ])->assertSessionHasNoErrors();

        // Surabaya Lead with same phone & email
        $responseSby = $this->post(route('public.leads.store', ['gym' => $this->surabayaGym->slug]), [
            'name' => 'Cross Lead Surabaya',
            'phone' => '081255667788',
            'email' => 'cross.lead@test.com',
        ]);

        $responseSby->assertSessionHasNoErrors();

        $this->assertDatabaseHas('leads', ['gym_id' => $this->flagshipGym->id, 'phone' => '081255667788']);
        $this->assertDatabaseHas('leads', ['gym_id' => $this->surabayaGym->id, 'phone' => '081255667788']);
    }

    public function test_authorized_admin_and_staff_can_view_leads_index_and_create_page(): void
    {
        // Gym Admin
        $response = $this->actingAs($this->flagshipAdmin)->get(route('admin.leads.index'));
        $response->assertOk();

        // Staff
        $responseStaff = $this->actingAs($this->flagshipStaff)->get(route('admin.leads.index'));
        $responseStaff->assertOk();

        $responseCreate = $this->actingAs($this->flagshipAdmin)->get(route('admin.leads.create'));
        $responseCreate->assertOk();
    }

    public function test_trainer_and_guest_are_forbidden_from_admin_leads(): void
    {
        $response = $this->actingAs($this->flagshipTrainer)->get(route('admin.leads.index'));
        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_when_accessing_admin_leads(): void
    {
        $response = $this->get(route('admin.leads.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_create_lead_manually(): void
    {
        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.store'), [
                'name' => 'Walk In Prospek',
                'phone' => '081900112233',
                'email' => 'walkin@test.com',
                'source' => 'walk_in',
                'source_detail' => 'Front Desk Walk In',
                'interest_type' => 'trial',
                'membership_plan_id' => $this->flagshipPlan->id,
                'assigned_to' => $this->flagshipStaff->id,
                'notes' => 'Tertarik mencoba fasilitas free trial.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $lead = Lead::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('phone', '081900112233')
            ->first();

        $this->assertNotNull($lead);
        $this->assertSame('Walk In Prospek', $lead->name);
        $this->assertSame('walk_in', $lead->source);
        $this->assertSame($this->flagshipStaff->id, $lead->assigned_to);
    }

    public function test_staff_assignment_is_tenant_scoped(): void
    {
        $lead = Lead::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'lead_number' => 'LEAD-999001',
            'name' => 'Assign Test Lead',
            'phone' => '081299900011',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Attempt to assign Surabaya staff to Flagship lead -> Rejected
        $responseCross = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.assign', $lead->id), [
                'assigned_to' => $this->surabayaAdmin->id,
            ]);

        $responseCross->assertSessionHasErrors('assigned_to');

        // Assign same gym staff -> Success
        $responseSame = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.assign', $lead->id), [
                'assigned_to' => $this->flagshipStaff->id,
            ]);

        $responseSame->assertSessionHasNoErrors();
        $lead->refresh();
        $this->assertSame($this->flagshipStaff->id, $lead->assigned_to);
    }

    public function test_status_transition_state_machine(): void
    {
        $lead = Lead::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'lead_number' => 'LEAD-999002',
            'name' => 'Status Test Lead',
            'phone' => '081299900022',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Invalid transition: new -> interested directly is not allowed
        $invalidResponse = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.status', $lead->id), [
                'status' => 'interested',
            ]);

        $invalidResponse->assertSessionHasErrors('status');

        // Valid transition: new -> contacted
        $validResponse = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.status', $lead->id), [
                'status' => 'contacted',
                'reason' => 'Sudah ditelepon staff.',
            ]);

        $validResponse->assertSessionHasNoErrors();
        $lead->refresh();
        $this->assertSame('contacted', $lead->status);

        // Valid transition: contacted -> qualified
        $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.status', $lead->id), [
                'status' => 'qualified',
            ])->assertSessionHasNoErrors();

        $lead->refresh();
        $this->assertSame('qualified', $lead->status);
    }

    public function test_record_contact_activity_and_auto_advance_new_status(): void
    {
        $lead = Lead::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'lead_number' => 'LEAD-999003',
            'name' => 'Contact Activity Lead',
            'phone' => '081299900033',
            'source' => 'website',
            'status' => 'new',
        ]);

        $response = $this->actingAs($this->flagshipStaff)
            ->post(route('admin.leads.contact', $lead->id), [
                'type' => 'whatsapp',
                'note' => 'Menghubungi via WA, calon member tertarik paket tahunan.',
                'contacted_at' => now()->format('Y-m-d H:i:s'),
                'next_follow_up_at' => now()->addDays(2)->format('Y-m-d'),
            ]);

        $response->assertSessionHasNoErrors();

        $lead->refresh();
        // Automatically transitioned from 'new' to 'contacted'
        $this->assertSame('contacted', $lead->status);
        $this->assertNotNull($lead->last_contacted_at);
        $this->assertNotNull($lead->next_follow_up_at);

        // Activity record created
        $activity = LeadActivity::withoutGymScope()->where('lead_id', $lead->id)->first();
        $this->assertNotNull($activity);
        $this->assertSame('whatsapp', $activity->type);
        $this->assertSame($this->flagshipStaff->id, $activity->user_id);
    }

    public function test_convert_lead_to_pending_registration_atomically_without_creating_member(): void
    {
        $initialMemberCount = Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();
        $initialMembershipCount = Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();

        $lead = Lead::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'lead_number' => 'LEAD-999004',
            'name' => 'Convertible Lead',
            'phone' => '081299900044',
            'email' => 'convertible@test.com',
            'membership_plan_id' => $this->flagshipPlan->id,
            'source' => 'website',
            'status' => 'interested',
        ]);

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.leads.convert', $lead->id), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Convertible Lead Updated',
                'email' => 'convertible@test.com',
                'phone' => '081299900044',
                'address' => 'Jl. Konversi No. 10',
            ]);

        $response->assertSessionHasNoErrors();

        $lead->refresh();
        $this->assertSame('converted', $lead->status);
        $this->assertNotNull($lead->converted_at);
        $this->assertNotNull($lead->membership_registration_id);

        // Verify MembershipRegistration was created with status = 'pending' and source = 'admin'
        $registration = MembershipRegistration::withoutGymScope()->find($lead->membership_registration_id);
        $this->assertNotNull($registration);
        $this->assertSame('pending', $registration->status);
        $this->assertSame('admin', $registration->source);
        $this->assertSame('Convertible Lead Updated', $registration->full_name);
        $this->assertNull($registration->member_id);
        $this->assertNull($registration->membership_id);

        // CRUCIAL: Verify Member and Membership were NOT created directly during lead conversion!
        $this->assertSame($initialMemberCount, Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
        $this->assertSame($initialMembershipCount, Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
    }

    public function test_tenant_isolation_prevents_cross_gym_lead_access_and_actions(): void
    {
        $jktLead = Lead::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'lead_number' => 'LEAD-999005',
            'name' => 'Jakarta Confidential Lead',
            'phone' => '081299900055',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Surabaya Admin attempts to view Jakarta lead -> Forbidden/NotFound
        $responseView = $this->actingAs($this->surabayaAdmin)->get(route('admin.leads.show', $jktLead->id));
        $this->assertTrue(in_array($responseView->status(), [403, 404], true));

        // Surabaya Admin attempts to convert Jakarta lead -> Forbidden/NotFound
        $responseConvert = $this->actingAs($this->surabayaAdmin)->post(route('admin.leads.convert', $jktLead->id), [
            'membership_plan_id' => $this->surabayaPlan->id,
        ]);
        $this->assertTrue(in_array($responseConvert->status(), [403, 404], true));
    }
}
