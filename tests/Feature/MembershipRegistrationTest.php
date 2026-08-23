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

class MembershipRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;
    protected Gym $surabayaGym;
    protected User $flagshipAdmin;
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
        $this->surabayaAdmin = User::where('email', 'admin.surabaya@exfits.com')->firstOrFail();

        $this->flagshipPlan = MembershipPlan::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->firstOrFail();
        $this->surabayaPlan = MembershipPlan::withoutGymScope()->where('gym_id', $this->surabayaGym->id)->firstOrFail();
    }

    public function test_public_registration_page_renders(): void
    {
        $response = $this->get(route('public.membership.register', ['gym' => $this->flagshipGym->slug]));

        $response->assertOk();
        $response->assertSee($this->flagshipPlan->name);
    }

    public function test_public_registration_submission_creates_pending_record(): void
    {
        Storage::fake('local');
        $initialMemberCount = Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();
        $initialMembershipCount = Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count();

        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->flagshipPlan->id,
            'full_name' => 'Aditya Pratama',
            'email' => 'aditya.pratama@test.com',
            'phone' => '081299998888',
            'gender' => 'male',
            'date_of_birth' => '1996-05-15',
            'address' => 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
            'city' => 'Jakarta Barat',
            'ktp' => UploadedFile::fake()->create('ktp.jpg', 500, 'image/jpeg'),
            'emergency_contact_name' => 'Siti Pratama',
            'emergency_contact_phone' => '081299998800',
            'emergency_contact_relationship' => 'Ibu',
            'notes' => 'Fokus latihan conditioning',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        // Verify registration created in pending status
        $this->assertDatabaseHas('membership_registrations', [
            'gym_id' => $this->flagshipGym->id,
            'email' => 'aditya.pratama@test.com',
            'status' => 'pending',
            'source' => 'website',
        ]);

        // Verify NO Member or Membership created yet
        $this->assertSame($initialMemberCount, Member::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
        $this->assertSame($initialMembershipCount, Membership::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->count());
    }

    public function test_duplicate_pending_registration_is_rejected(): void
    {
        Storage::fake('local');
        // First registration
        $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->flagshipPlan->id,
            'full_name' => 'Budi Santoso',
            'email' => 'budi.santoso@test.com',
            'phone' => '081211112222',
            'address' => 'Jl. Sudirman 10',
            'ktp' => UploadedFile::fake()->create('ktp.jpg', 500, 'image/jpeg'),
        ])->assertSessionHasNoErrors();

        // Second registration with same email
        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->flagshipPlan->id,
            'full_name' => 'Budi Santoso Clone',
            'email' => 'budi.santoso@test.com',
            'phone' => '081233334444',
            'address' => 'Jl. Sudirman 10',
            'ktp' => UploadedFile::fake()->create('ktp.jpg', 500, 'image/jpeg'),
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_cannot_register_with_cross_tenant_plan(): void
    {
        Storage::fake('local');
        // Attempt to register at Jakarta Flagship using Surabaya's plan
        $response = $this->post(route('public.membership.register.store', ['gym' => $this->flagshipGym->slug]), [
            'membership_plan_id' => $this->surabayaPlan->id,
            'full_name' => 'Hacker User',
            'email' => 'hacker@test.com',
            'phone' => '081999999999',
            'address' => 'Unknown address',
            'ktp' => UploadedFile::fake()->create('ktp.jpg', 500, 'image/jpeg'),
        ]);

        $response->assertSessionHasErrors('membership_plan_id');
    }

    public function test_admin_can_view_registrations_index_and_show(): void
    {
        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->firstOrFail();

        $response = $this->actingAs($this->flagshipAdmin)
            ->get(route('admin.membership-registrations.index'));

        $response->assertOk();
        $response->assertSee($reg->registration_number);

        $showResponse = $this->actingAs($this->flagshipAdmin)
            ->get(route('admin.membership-registrations.show', $reg->id));

        $showResponse->assertOk();
        $showResponse->assertSee($reg->full_name);
    }

    public function test_admin_can_approve_registration_transactionally(): void
    {
        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.approve', $reg->id), [
                'start_date' => now()->format('Y-m-d'),
                'payment_status' => 'paid',
                'notes' => 'Approved by front desk admin.',
            ]);

        $response->assertRedirect(route('admin.membership-registrations.show', $reg->id));
        $response->assertSessionHas('success');

        $reg->refresh();
        $this->assertSame('approved', $reg->status);
        $this->assertSame($this->flagshipAdmin->id, $reg->reviewed_by);
        $this->assertNotNull($reg->member_id);
        $this->assertNotNull($reg->membership_id);

        // Verify Member created
        $member = Member::withoutGymScope()->find($reg->member_id);
        $this->assertNotNull($member);
        $this->assertSame($reg->full_name, $member->full_name);
        $this->assertSame($reg->email, $member->email);
        $this->assertStringStartsWith('MEM-', $member->member_number);

        // Verify Membership created with correct price and quota snapshot
        $membership = Membership::withoutGymScope()->find($reg->membership_id);
        $this->assertNotNull($membership);
        $this->assertSame($member->id, $membership->member_id);
        $this->assertSame($reg->membership_plan_id, $membership->membership_plan_id);
        $this->assertEquals($reg->membershipPlan->price, $membership->price);
        $this->assertEquals($reg->membershipPlan->trainer_quota, $membership->trainer_quota_total);
        $this->assertSame('active', $membership->status);

        // Verify Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'gym_id' => $this->flagshipGym->id,
            'action' => 'registration.approved',
        ]);
    }

    public function test_admin_can_reject_registration_with_reason(): void
    {
        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $initialMemberCount = Member::withoutGymScope()->count();

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.reject', $reg->id), [
                'rejection_reason' => 'Nomor telepon tidak valid dan data tidak lengkap.',
            ]);

        $response->assertRedirect(route('admin.membership-registrations.show', $reg->id));
        $response->assertSessionHas('success');

        $reg->refresh();
        $this->assertSame('rejected', $reg->status);
        $this->assertSame('Nomor telepon tidak valid dan data tidak lengkap.', $reg->rejection_reason);
        $this->assertSame($this->flagshipAdmin->id, $reg->reviewed_by);
        $this->assertNull($reg->member_id);

        // Assert NO new member created
        $this->assertSame($initialMemberCount, Member::withoutGymScope()->count());
    }

    public function test_admin_can_cancel_pending_registration(): void
    {
        $reg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $response = $this->actingAs($this->flagshipAdmin)
            ->post(route('admin.membership-registrations.cancel', $reg->id), [
                'reason' => 'Dibatalkan atas permintaan pemohon.',
            ]);

        $response->assertRedirect(route('admin.membership-registrations.show', $reg->id));
        $reg->refresh();
        $this->assertSame('cancelled', $reg->status);
    }

    public function test_tenant_isolation_prevents_cross_gym_view_or_approval(): void
    {
        // Jakarta Flagship registration
        $jktReg = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $this->flagshipGym->id)
            ->where('status', 'pending')
            ->firstOrFail();

        // Surabaya Admin attempts to view Jakarta registration
        $response = $this->actingAs($this->surabayaAdmin)
            ->get(route('admin.membership-registrations.show', $jktReg->id));

        $this->assertTrue(in_array($response->status(), [403, 404], true));

        // Surabaya Admin attempts to approve Jakarta registration
        $approveResponse = $this->actingAs($this->surabayaAdmin)
            ->post(route('admin.membership-registrations.approve', $jktReg->id), [
                'start_date' => now()->format('Y-m-d'),
            ]);

        $this->assertTrue(in_array($approveResponse->status(), [403, 404], true));
    }
}
