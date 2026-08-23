<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\Memberships\MembershipService;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class MembershipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_memberships_index(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.memberships.index'));
        $response->assertStatus(200);
    }

    public function test_creates_membership_with_authoritative_price_and_quota_snapshot(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $plan = MembershipPlan::where('gym_id', $flagshipAdmin->gym_id)->where('slug', 'premium-monthly')->first();

        // Create a new member without active membership
        $member = Member::factory()->create(['gym_id' => $flagshipAdmin->gym_id]);

        $postData = [
            'member_id' => $member->id,
            'membership_plan_id' => $plan->id,
            'start_date' => '2026-10-01',
            'status' => 'active',
            'payment_status' => 'paid',
            'price' => 1000, // Price tampering attempt! Must be ignored by backend
        ];

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.memberships.store'), $postData);
        $response->assertRedirect();

        $membership = Membership::where('member_id', $member->id)->latest('id')->first();
        $this->assertNotNull($membership);

        // Assert price was snapshotted from plan (550000), not the tampered 1000
        $this->assertEquals((float) $plan->price, (float) $membership->price);
        $this->assertEquals($plan->trainer_quota, $membership->trainer_quota_total);
        $this->assertEquals(0, $membership->trainer_quota_used);
        $this->assertEquals(4, $membership->remaining_trainer_quota);

        // Assert end date was calculated accurately (1 month minus 1 day)
        $this->assertEquals('2026-10-31', $membership->end_date->format('Y-m-d'));
    }

    public function test_prevents_overlapping_active_memberships(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $plan = MembershipPlan::where('gym_id', $flagshipAdmin->gym_id)->first();
        $member = Member::factory()->create(['gym_id' => $flagshipAdmin->gym_id]);

        // Create first active membership: 2026-10-01 to 2026-10-31
        Membership::withoutGymScope()->create([
            'gym_id' => $flagshipAdmin->gym_id,
            'member_id' => $member->id,
            'membership_plan_id' => $plan->id,
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'status' => 'active',
            'price' => $plan->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 0,
            'trainer_quota_used' => 0,
        ]);

        // Attempting to create an overlapping active membership (2026-10-15) must fail
        $response = $this->actingAs($flagshipAdmin)->post(route('admin.memberships.store'), [
            'member_id' => $member->id,
            'membership_plan_id' => $plan->id,
            'start_date' => '2026-10-15',
            'status' => 'active',
            'payment_status' => 'paid',
        ]);

        $response->assertSessionHasErrors(['member_id']);
    }

    public function test_member_relationships_load_correctly(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first();

        $this->assertNotNull($arya->activeMembership);
        $this->assertCount(2, $arya->memberships); // 1 active, 1 expired history
    }

    public function test_membership_status_can_be_updated(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $membership = Membership::where('gym_id', $flagshipAdmin->gym_id)->first();

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.memberships.update', $membership->id), [
            'status' => 'cancelled',
            'payment_status' => 'refunded',
            'notes' => 'Member moved abroad.',
        ]);

        $response->assertRedirect(route('admin.memberships.show', $membership->id));

        $membership->refresh();
        $this->assertEquals('cancelled', $membership->status);
        $this->assertEquals('refunded', $membership->payment_status);
        $this->assertEquals('Member moved abroad.', $membership->notes);
    }
}