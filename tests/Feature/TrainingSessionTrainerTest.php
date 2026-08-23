<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Trainer;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use App\Services\Attendance\AttendanceService;
use App\Services\Workouts\WorkoutSessionService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingSessionTrainerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_can_create_workout_session_with_trainer(): void
    {
        /** @var WorkoutSessionService $service */
        $service = app(WorkoutSessionService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $workoutType = WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first();
        $attendance = $member->activeAttendance;
        TrainingSession::withoutGymScope()->where('attendance_id', $attendance->id)->where('status', 'in_progress')->delete();

        $session = $service->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: $trainer->id,
            notes: 'Coached session test',
            gymId: $flagshipGym->id
        );

        $this->assertNotNull($session);
        $this->assertEquals($trainer->id, $session->trainer_id);
        $this->assertEquals('in_progress', $session->status);
        $this->assertNull($session->trainer_quota_consumed_at);
    }

    public function test_completing_workout_session_consumes_trainer_quota(): void
    {
        /** @var WorkoutSessionService $service */
        $service = app(WorkoutSessionService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $workoutType = WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first();
        $membership = $member->activeMembership;
        $initialUsed = $membership->trainer_quota_used;

        $session = TrainingSession::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'attendance_id' => $member->activeAttendance->id,
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'workout_type_id' => $workoutType->id,
            'trainer_id' => $trainer->id,
            'started_at' => now()->subMinutes(45),
            'status' => 'in_progress',
        ]);

        $completedSession = $service->completeSession(
            session: $session,
            notes: 'Great workout completed with coach'
        );

        $this->assertEquals('completed', $completedSession->status);
        $this->assertNotNull($completedSession->completed_at);
        $this->assertNotNull($completedSession->trainer_quota_consumed_at);

        $membership->refresh();
        $this->assertEquals($initialUsed + 1, $membership->trainer_quota_used);
    }

    public function test_attendance_checkout_auto_completes_session_and_consumes_quota(): void
    {
        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $workoutType = WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first();
        $attendance = $member->activeAttendance;

        // Clean any pre-existing in-progress sessions for this attendance
        TrainingSession::withoutGymScope()->where('attendance_id', $attendance->id)->where('status', 'in_progress')->delete();

        $membership = $member->activeMembership;
        $initialUsed = $membership->trainer_quota_used;

        // Create single active training session with trainer
        $session = TrainingSession::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'attendance_id' => $attendance->id,
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'workout_type_id' => $workoutType->id,
            'trainer_id' => $trainer->id,
            'started_at' => now()->subMinutes(30),
            'status' => 'in_progress',
        ]);

        // Checkout attendance
        $attendanceService->checkOut($attendance, 'front_desk', 'Member leaving gym');

        $session->refresh();
        $membership->refresh();

        $this->assertEquals('completed', $session->status);
        $this->assertNotNull($session->completed_at);
        $this->assertNotNull($session->trainer_quota_consumed_at);
        $this->assertEquals($initialUsed + 1, $membership->trainer_quota_used);
    }
}
