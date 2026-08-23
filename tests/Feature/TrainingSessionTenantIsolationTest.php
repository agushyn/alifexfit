<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\WorkoutType;
use App\Services\Workouts\WorkoutSessionService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class TrainingSessionTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_from_gym_a_cannot_create_session_with_gym_b_attendance(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $surabayaAttendance = Attendance::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->where('status', 'in_gym')
            ->first();

        $jktWorkout = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->first();

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $sessionService->createSession(
            attendanceId: $surabayaAttendance->id,
            workoutTypeId: $jktWorkout->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );
    }

    public function test_user_from_gym_a_cannot_create_session_with_gym_b_workout_type(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $surabayaWorkout = WorkoutType::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $sessionService->createSession(
            attendanceId: $arya->activeAttendance->id,
            workoutTypeId: $surabayaWorkout->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );
    }

    public function test_user_from_gym_a_cannot_view_or_modify_gym_b_session(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $surabayaSession = TrainingSession::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        // Policy Gate denial
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('view', $surabayaSession));
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('update', $surabayaSession));
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('delete', $surabayaSession));

        // HTTP access rejection
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.workout-sessions.show', $surabayaSession->id));
        $this->assertTrue(in_array($response->status(), [403, 404]));
    }
}