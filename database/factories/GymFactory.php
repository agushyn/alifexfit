<?php

namespace Database\Factories;

use App\Models\Gym;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GymFactory extends Factory
{
    protected $model = Gym::class;

    public function definition(): array
    {
        $name = fake()->company() . ' Gym';
        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numberBetween(100, 999),
            'code' => 'EXF-' . strtoupper(fake()->unique()->lexify('???##')),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'address' => fake()->address(),
            'logo' => null,
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
