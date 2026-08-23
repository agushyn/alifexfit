<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Trainer;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_api_can_list_active_trainers(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.trainers.index', ['gym_id' => $flagshipGym->id]));
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'specialization', 'bio', 'profile_photo_url', 'status']
            ]
        ]);

        // Internal notes must not be leaked in public API
        $response->assertJsonMissing(['notes']);
    }

    public function test_api_can_get_available_trainers(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.trainers.available', [
            'gym_id' => $flagshipGym->id,
            'time' => '2026-08-24 09:30:00', // Monday morning
        ]));

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_api_can_get_trainer_detail(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::withoutGymScope()->where('status', 'active')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.trainers.show', $trainer->id));
        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $trainer->id,
                'name' => $trainer->name,
            ]
        ]);
        $response->assertJsonMissing(['notes']);
    }

    public function test_api_can_get_member_trainer_quota(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.trainer.quota', ['member_id' => $member->id]));
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'has_active_membership',
                'total',
                'used',
                'remaining',
                'has_available',
            ]
        ]);
    }
}
