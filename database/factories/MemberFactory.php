<?php

namespace Database\Factories;

use App\Models\Gym;
use App\Models\Member;
use App\Services\MemberIdGenerator;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();

        return [
            'gym_id' => Gym::factory(),
            'member_number' => fn (array $attrs) => app(MemberIdGenerator::class)->generate($attrs['gym_id'] instanceof Gym ? $attrs['gym_id']->id : (int) $attrs['gym_id']),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'full_name' => "{$firstName} {$lastName}",
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'date_of_birth' => fake()->dateTimeBetween('-45 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female']),
            'address' => fake()->streetAddress() . ', Jakarta',
            'emergency_contact' => [
                'name' => fake()->name(),
                'phone' => fake()->phoneNumber(),
                'relationship' => fake()->randomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
            ],
            'profile_photo' => null,
            'status' => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['status' => 'inactive']);
    }

    public function suspended(): static
    {
        return $this->state(fn () => ['status' => 'suspended']);
    }

    public function expired(): static
    {
        return $this->state(fn () => ['status' => 'expired']);
    }
}