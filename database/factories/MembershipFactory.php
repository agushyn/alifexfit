<?php

namespace Database\Factories;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class MembershipFactory extends Factory
{
    protected $model = Membership::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 months', 'now');
        $endDate = (clone $startDate)->modify('+1 month');

        return [
            'gym_id' => fn (array $attrs) => Member::find($attrs['member_id'])?->gym_id ?? Gym::factory(),
            'member_id' => Member::factory(),
            'membership_plan_id' => MembershipPlan::factory(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'status' => 'active',
            'price' => 500000,
            'payment_status' => 'paid',
            'trainer_quota_total' => 4,
            'trainer_quota_used' => 0,
            'notes' => fake()->sentence(),
        ];
    }
}