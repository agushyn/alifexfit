<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\WorkoutType;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingSessionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_api_can_fetch_active_workout_types(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.workout-types'));
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_api_can_create_workout_session(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        // Check in Dian first
        $responseIn = $this->actingAs($flagshipAdmin)->postJson(route('api.attendance.checkin'), [
            'member_number' => $dian->member_number,
            'source' => 'app',
        ]);
        $attendanceId = $responseIn->json('data.attendance.id');

        $workoutType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'active')->first();

        // Create workout session via API
        $responseSession = $this->actingAs($flagshipAdmin)->postJson(route('api.workout-sessions.store'), [
            'attendance_id' => $attendanceId,
            'workout_type_id' => $workoutType->id,
            'notes' => 'API App session',
        ]);

        $responseSession->assertStatus(201);
        $responseSession->assertJsonPath('success', true);
        $responseSession->assertJsonPath('data.status', 'in_progress');
        $responseSession->assertJsonPath('data.member_id', $dian->id);
    }

    public function test_api_can_complete_workout_session(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $session = TrainingSession::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'in_progress')->first();

        $response = $this->actingAs($flagshipAdmin)->patchJson(route('api.workout-sessions.complete', $session->id), [
            'notes' => 'Completed via mobile API',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.status', 'completed');
    }

    public function test_api_can_fetch_active_workout_sessions(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.workout-sessions.active'));
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(1, $response->json('count'));
    }
}