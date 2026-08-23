<?php

namespace Database\Factories;

use App\Models\Gym;
use App\Models\WorkoutType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WorkoutTypeFactory extends Factory
{
    protected $model = WorkoutType::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Strength & Conditioning',
            'Cardio Endurance',
            'HIIT Blast',
            'Functional Core',
            'Yoga & Mobility',
            'Boxing Conditioning',
        ]) . ' ' . fake()->randomNumber(3);

        return [
            'gym_id' => Gym::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'category' => 'Strength',
            'status' => 'active',
            'sort_order' => 0,
        ];
    }
}