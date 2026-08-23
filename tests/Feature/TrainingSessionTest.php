<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\WorkoutType;
use App\Services\Attendance\AttendanceService;
use App\Services\Workouts\WorkoutSessionService;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_workout_sessions_index(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.workout-sessions.index'));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_view_workout_session_show(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $session = TrainingSession::where('gym_id', $flagshipAdmin->gym_id)->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.workout-sessions.show', $session->id));
        $response->assertStatus(200);
    }

    public function test_successful_workout_session_creation(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);
        $attendance = $attendanceService->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);

        $workoutType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'active')->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $session = $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: null,
            notes: 'Leg day test',
            gymId: $flagshipAdmin->gym_id
        );

        $this->assertNotNull($session);
        $this->assertEquals('in_progress', $session->status);
        $this->assertEquals($dian->id, $session->member_id);
        $this->assertEquals($attendance->id, $session->attendance_id);
        $this->assertEquals($workoutType->id, $session->workout_type_id);
        $this->assertEquals($flagshipAdmin->gym_id, $session->gym_id);
        $this->assertNull($session->completed_at);
    }

    public function test_session_creation_fails_if_attendance_is_inactive(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $completedAttendance = Attendance::where('gym_id', $flagshipAdmin->gym_id)
            ->where('status', 'checked_out')
            ->first();

        $workoutType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'active')->first();

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $sessionService->createSession(
            attendanceId: $completedAttendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );
    }

    public function test_session_creation_fails_if_workout_type_is_inactive(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);
        $attendance = $attendanceService->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);

        $inactiveWorkout = WorkoutType::factory()->create([
            'gym_id' => $flagshipAdmin->gym_id,
            'status' => 'inactive',
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $inactiveWorkout->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );
    }

    public function test_duplicate_active_session_for_same_workout_type_is_rejected(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);
        $attendance = $attendanceService->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);

        $workoutType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'active')->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);

        // First session created
        $session1 = $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );

        $this->assertNotNull($session1);

        // Second simultaneous session of same workout type must fail
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );
    }

    public function test_multiple_distinct_workout_sessions_during_one_attendance_succeed(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);
        $attendance = $attendanceService->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);

        $strengthType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('name', 'Strength & Conditioning')->first();
        $cardioType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('name', 'Cardio Endurance')->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);

        // Session 1: Strength
        $session1 = $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $strengthType->id,
            trainerId: null,
            notes: 'Strength session',
            gymId: $flagshipAdmin->gym_id
        );

        // Complete session 1
        $sessionService->completeSession($session1);

        // Session 2: Cardio
        $session2 = $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $cardioType->id,
            trainerId: null,
            notes: 'Cardio finisher',
            gymId: $flagshipAdmin->gym_id
        );

        $this->assertNotNull($session2);
        $this->assertEquals($attendance->id, $session2->attendance_id);
        $this->assertNotEquals($session1->id, $session2->id);
    }

    public function test_session_completion(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $inProgressSession = TrainingSession::where('gym_id', $flagshipAdmin->gym_id)
            ->where('status', 'in_progress')
            ->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $completed = $sessionService->completeSession($inProgressSession, 'Done with training');

        $this->assertEquals('completed', $completed->status);
        $this->assertNotNull($completed->completed_at);
        $this->assertEquals('Done with training', $completed->notes);
    }

    public function test_session_cancellation(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $session = TrainingSession::where('gym_id', $flagshipAdmin->gym_id)->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $cancelled = $sessionService->cancelSession($session, 'Member felt unwell');

        $this->assertEquals('cancelled', $cancelled->status);
        $this->assertStringContainsString('Member felt unwell', $cancelled->notes);
    }

    public function test_attendance_checkout_automatically_completes_active_workout_session(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $attendanceService */
        $attendanceService = app(AttendanceService::class);
        $attendance = $attendanceService->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);

        $workoutType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('status', 'active')->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $session = $sessionService->createSession(
            attendanceId: $attendance->id,
            workoutTypeId: $workoutType->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );

        $this->assertEquals('in_progress', $session->status);

        // Now checkout attendance
        $attendanceService->checkOut($attendance);

        $session->refresh();
        $this->assertEquals('completed', $session->status);
        $this->assertNotNull($session->completed_at);
    }

    public function test_no_trainer_quota_is_deducted_in_phase_4b(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first();
        $membership = $arya->activeMembership;

        $initialUsed = $membership->trainer_quota_used;

        $cardioType = WorkoutType::where('gym_id', $flagshipAdmin->gym_id)->where('name', 'Cardio Endurance')->first();

        /** @var WorkoutSessionService $sessionService */
        $sessionService = app(WorkoutSessionService::class);
        $session = $sessionService->createSession(
            attendanceId: $arya->activeAttendance->id,
            workoutTypeId: $cardioType->id,
            trainerId: null,
            notes: null,
            gymId: $flagshipAdmin->gym_id
        );

        $sessionService->completeSession($session);

        $membership->refresh();
        $this->assertEquals($initialUsed, $membership->trainer_quota_used);
    }
}