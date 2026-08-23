<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OnsiteMembershipRegistrationTest extends TestCase
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

    public function test_authorized_admin_and_staff_can_view_onsite_registration_page(): void
    {
        // Gym Admin
        $response = $this->actingAs($this->flagshipAdmin)
            ->get(route('admin.membership-registrations.onsite.create'));

        $response->assertOk();
        $response->assertSee($this->flagshipPlan->name);

        // Staff
        $staffResponse = $this->actingAs($this->flagshipStaff)
            ->get(route('admin.membership-registrations.onsite.create'));

        $staffResponse->assertOk();
    }

    public function test_trainer_and_unauthorized_user_cannot_access_onsite_registration(): void
    {
        // Trainer
        $response = $this->actingAs($this->flagshipTrainer)
            ->get(route('admin.membership-registrations.onsite.create'));

        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_when_accessing_onsite_registration(): void
    {
        // Guest
        $guestResponse = $this->get(route('admin.membership-registrations.onsite.create'));
        $guestResponse->assertRedirect(route('login'));
    }

    public function test_onsite_registration_creates_registration_member_and_membership_atomically(): void
    {
        $initialMemberCount = Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();
        $initialMembershipCount = Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Michael Chandra',
                'email' => 'michael.chandra@test.com',
                'phone' => '081288776655',
                'gender' => 'male',
                'date_of_birth' => '1994-08-20',
                'address' => 'Jl. Mega Kuningan Barat No. 8',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Linda Chandra',
                'emergency_contact_phone' => '081288776600',
                'emergency_contact_relationship' => 'Istri',
                'start_date' => now()->format('Y-m-d'),
                'notes' => 'Walk-in registration at front desk.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // Verify Member created
        $this->assertSame($initialMemberCount + 1, Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
        $member = Member::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'michael.chandra@test.com')
            ->first();

        $this->assertNotNull($member);
        $this->assertSame('Michael Chandra', $member->full_name);
        $this->assertSame('081288776655', $member->phone);
        $this->assertStringStartsWith('MEM-', $member->member_number);
        $this->assertSame('active', $member->status);

        // Verify Membership created with exact plan snapshot
        $this->assertSame($initialMembershipCount + 1, Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
        $membership = Membership::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('member_id', $member->id)
            ->first();

        $this->assertNotNull($membership);
        $this->assertSame($this->flagshipPlan->id, $membership->membership_plan_id);
        $this->assertEquals($this->flagshipPlan->price, $membership->price);
        $this->assertEquals($this->flagshipPlan->trainer_quota, $membership->trainer_quota_total);
        $this->assertSame('active', $membership->status);

        // Verify Registration Record (source = 'admin', status = 'approved')
        $registration = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'michael.chandra@test.com')
            ->first();

        $this->assertNotNull($registration);
        $this->assertSame('admin', $registration->source);
        $this->assertSame('approved', $registration->status);
        $this->assertStringStartsWith('REG-', $registration->registration_number);
        $this->assertSame($this->flagshipAdmin->id, $registration->reviewed_by);
        $this->assertNotNull($registration->reviewed_at);
        $this->assertSame($member->id, $registration->member_id);
        $this->assertSame($membership->id, $registration->membership_id);

        // Verify redirected to success page
        $response->assertRedirect(route('admin.membership-registrations.onsite.success', $registration->id));

        // Verify Audit Logs
        $this->assertDatabaseHas('audit_logs', [
            'gym_id' => $this->flagshipGym->id,
            'action' => 'registration.created',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'gym_id' => $this->flagshipGym->id,
            'action' => 'registration.approved',
        ]);
    }

    public function test_onsite_registration_with_photo_upload(): void
    {
        Storage::fake('public');
        $photo = UploadedFile::fake()->image('member_avatar.jpg', 400, 400);

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Steffi Indrawan',
                'email' => 'steffi.indrawan@test.com',
                'phone' => '081377889900',
                'address' => 'Jl. Gatot Subroto No. 55',
                'photo' => $photo,
            ]);

        $response->assertSessionHasNoErrors();

        $member = Member::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'steffi.indrawan@test.com')
            ->first();

        $this->assertNotNull($member);
        $this->assertNotNull($member->profile_photo);
    }

    public function test_duplicate_member_in_same_tenant_is_rejected(): void
    {
        // First registration
        $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Original Member',
                'email' => 'duplicate.check@test.com',
                'phone' => '081299990001',
                'address' => 'Jl. Asli No. 1',
            ])->assertSessionHasNoErrors();

        // Attempt second registration with duplicate email
        $responseEmail = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Clone Member Email',
                'email' => 'duplicate.check@test.com',
                'phone' => '081299990002',
                'address' => 'Jl. Asli No. 2',
            ]);

        $responseEmail->assertSessionHasErrors('email');

        // Attempt third registration with duplicate phone
        $responsePhone = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Clone Member Phone',
                'email' => 'other.email@test.com',
                'phone' => '081299990001',
                'address' => 'Jl. Asli No. 3',
            ]);

        $responsePhone->assertSessionHasErrors('email');
    }

    public function test_cross_tenant_duplicate_member_is_allowed(): void
    {
        // Jakarta Flagship registers member
        $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Cross Tenant User',
                'email' => 'cross.tenant@test.com',
                'phone' => '081555666777',
                'address' => 'Jakarta Address',
            ])->assertSessionHasNoErrors();

        // Surabaya Branch registers member with same email/phone
        $surabayaResponse = $this->actingAs($this->surabayaAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->surabayaPlan->id,
                'full_name' => 'Cross Tenant User Sby',
                'email' => 'cross.tenant@test.com',
                'phone' => '081555666777',
                'address' => 'Surabaya Address',
            ]);

        $surabayaResponse->assertSessionHasNoErrors();
        $surabayaResponse->assertRedirect();

        // Both members exist in their respective gym scopes
        $this->assertDatabaseHas('members', ['gym_id' => $this->flagshipGym->id, 'email' => 'cross.tenant@test.com']);
        $this->assertDatabaseHas('members', ['gym_id' => $this->surabayaGym->id, 'email' => 'cross.tenant@test.com']);
    }

    public function test_cannot_select_cross_tenant_plan(): void
    {
        // Jakarta Admin attempts to register using Surabaya's plan ID
        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->surabayaPlan->id,
                'full_name' => 'Invalid Plan User',
                'email' => 'invalid.plan@test.com',
                'phone' => '081999888777',
                'address' => 'Jl. Test No. 99',
            ]);

        $response->assertSessionHasErrors('membership_plan_id');
    }

    public function test_onsite_success_page_renders_with_created_entities(): void
    {
        $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Success Page Test User',
                'email' => 'success.user@test.com',
                'phone' => '081234500000',
                'address' => 'Jl. Sukses No. 100',
            ]);

        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'success.user@test.com')
            ->firstOrFail();

        $response = $this->actingAs($this->flagshipAdmin)
            ->get(route('admin.membership-registrations.onsite.success', $reg->id));

        $response->assertOk();
        $response->assertSee($reg->registration_number);
        $response->assertSee('Success Page Test User');
    }

    public function test_tenant_isolation_prevents_cross_gym_onsite_success_view(): void
    {
        $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.onsite.store'), [
                'membership_plan_id' => $this->flagshipPlan->id,
                'full_name' => 'Jakarta Only Member',
                'email' => 'jkt.only@test.com',
                'phone' => '081234599999',
                'address' => 'Jl. Jakarta Raya',
            ]);

        $jktReg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('email', 'jkt.only@test.com')
            ->firstOrFail();

        // Surabaya Admin attempts to view Jakarta onsite success receipt
        $response = $this->actingAs($this->surabayaAdmin)
            ->get(route('admin.membership-registrations.onsite.success', $jktReg->id));

        $this->assertTrue(in_array($response->status(), [403, 404], true));
    }
}
