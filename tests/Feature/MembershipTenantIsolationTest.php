<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\Memberships\MembershipService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_cannot_assign_member_from_gym_a_to_plan_from_gym_b(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $flagshipMember = Member::withoutGymScope()->where('gym_id', $flagshipGym->id)->first();
        $surabayaPlan = MembershipPlan::withoutGymScope()->where('gym_id', $surabayaGym->id)->first();

        // Attempting to create membership with mismatched tenant entities
        $this->expectException(\InvalidArgumentException::class);

        /** @var MembershipService $service */
        $service = app(MembershipService::class);
        $service->createMembership([
            'member_id' => $flagshipMember->id,
            'membership_plan_id' => $surabayaPlan->id,
            'start_date' => '2026-11-01',
            'status' => 'active',
            'payment_status' => 'paid',
        ], $flagshipGym->id);
    }

    public function test_gym_a_user_cannot_view_or_update_gym_b_membership(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $surabayaMembership = Membership::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        // Policy Gate denial
        $this->assertFalse(\Illuminate\Support\Facades\Gate::forUser($flagshipAdmin)->allows('view', $surabayaMembership));
        $this->assertFalse(\Illuminate\Support\Facades\Gate::forUser($flagshipAdmin)->allows('update', $surabayaMembership));

        // HTTP View & Update attempts are rejected due to tenant scoping
        $responseView = $this->actingAs($flagshipAdmin)->get(route('admin.memberships.show', $surabayaMembership->id));
        $this->assertTrue(in_array($responseView->status(), [403, 404]), "Expected 403 or 404 but got {$responseView->status()}");

        $responseUpdate = $this->actingAs($flagshipAdmin)->put(route('admin.memberships.update', $surabayaMembership->id), [
            'status' => 'cancelled',
        ]);
        $this->assertTrue(in_array($responseUpdate->status(), [403, 404]), "Expected 403 or 404 but got {$responseUpdate->status()}");
    }

    public function test_super_admin_can_access_memberships_across_all_gyms(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $surabayaMembership = Membership::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        $response = $this->actingAs($superAdmin)->get(route('admin.memberships.show', $surabayaMembership->id));
        $response->assertStatus(200);
    }
}