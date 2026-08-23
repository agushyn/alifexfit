<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use App\Models\WorkoutType;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutTypeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_workout_types(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.workout-types.index'));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_create_workout_type(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.workout-types.store'), [
            'name' => 'Olympic Weightlifting',
            'category' => 'Strength',
            'description' => 'Snatch and Clean & Jerk technique sessions.',
            'status' => 'active',
            'sort_order' => 7,
        ]);

        $response->assertRedirect(route('admin.workout-types.index'));

        $this->assertDatabaseHas('workout_types', [
            'name' => 'Olympic Weightlifting',
            'category' => 'Strength',
            'gym_id' => $flagshipAdmin->gym_id,
        ]);
    }

    public function test_user_cannot_update_workout_type_from_another_gym(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $surabayaWorkout = WorkoutType::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.workout-types.update', $surabayaWorkout->id), [
            'name' => 'Hacked Discipline',
            'category' => 'Strength',
            'status' => 'inactive',
        ]);

        $response->assertStatus(403);
    }
}