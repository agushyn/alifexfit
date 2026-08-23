<?php

namespace Database\Factories;

use App\Models\Gym;
use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MembershipPlanFactory extends Factory
{
    protected $model = MembershipPlan::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Basic Monthly',
            'Standard Quarterly',
            'Gold 6-Months',
            'VIP Annual Platinum',
            'Student Pass',
            'Corporate Unlimited',
        ]) . ' ' . fake()->randomNumber(3);

        return [
            'gym_id' => Gym::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price' => fake()->randomElement([350000, 500000, 750000, 1200000, 3500000]),
            'billing_period' => 'monthly',
            'duration' => 1,
            'joining_fee' => 50000,
            'trainer_quota' => fake()->randomElement([0, 2, 4, 8]),
            'benefits' => ['Full Gym Access', 'Locker Room'],
            'status' => 'active',
            'featured' => false,
            'sort_order' => 0,
        ];
    }
}