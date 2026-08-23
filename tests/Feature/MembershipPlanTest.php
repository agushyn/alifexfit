<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\MembershipPlan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipPlanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_membership_plans(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.membership-plans.index'));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_create_membership_plan(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $planData = [
            'name' => 'Gold VIP Semi-Annual',
            'description' => '6-month all access with trainer sessions',
            'price' => 2800000,
            'billing_period' => 'monthly',
            'duration' => 6,
            'joining_fee' => 0,
            'trainer_quota' => 12,
            'status' => 'active',
            'featured' => true,
            'sort_order' => 5,
        ];

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.membership-plans.store'), $planData);
        $response->assertRedirect(route('admin.membership-plans.index'));

        $this->assertDatabaseHas('membership_plans', [
            'name' => 'Gold VIP Semi-Annual',
            'price' => 2800000,
            'duration' => 6,
            'gym_id' => $flagshipAdmin->gym_id,
        ]);
    }

    public function test_membership_plan_price_must_be_non_negative(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.membership-plans.store'), [
            'name' => 'Invalid Price Plan',
            'price' => -1000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'status' => 'active',
        ]);

        $response->assertSessionHasErrors(['price']);
    }

    public function test_authorized_user_can_update_plan(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $plan = MembershipPlan::where('gym_id', $flagshipAdmin->gym_id)->first();

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.membership-plans.update', $plan->id), [
            'name' => 'Updated Plan Name',
            'price' => 600000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'status' => 'active',
            'featured' => false,
        ]);

        $response->assertRedirect(route('admin.membership-plans.index'));
        $this->assertDatabaseHas('membership_plans', [
            'id' => $plan->id,
            'name' => 'Updated Plan Name',
            'price' => 600000,
        ]);
    }

    public function test_user_cannot_access_or_update_plans_from_another_gym(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $surabayaPlan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.membership-plans.update', $surabayaPlan->id), [
            'name' => 'Hacked Plan Name',
            'price' => 1000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }
}