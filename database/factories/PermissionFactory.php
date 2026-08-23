<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $name = fake()->unique()->word() . '.' . fake()->word();
        return [
            'name' => $name,
            'display_name' => ucfirst($name),
            'group' => 'General',
            'description' => fake()->sentence(),
        ];
    }
}
