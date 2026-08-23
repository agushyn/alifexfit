<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberMobileApiTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;
    protected Gym $surabayaGym;
    protected Member $flagshipMember;
    protected Member $surabayaMember;
    protected MembershipPlan $flagshipPlan;
    protected WorkoutType $flagshipWorkoutType;
    protected Trainer $flagshipTrainer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->flagshipGym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->surabayaGym = Gym::where('code', 'EXF-SBY-02')->firstOrFail();

        $this->flagshipMember = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->firstOrFail();
        $this->surabayaMember = Member::withoutGymScope()->where('email', 'budi.santoso@example.com')->firstOrFail();

        $this->flagshipPlan = MembershipPlan::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->where('status', 'active')->firstOrFail();
        $this->flagshipWorkoutType = WorkoutType::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->where('status', 'active')->firstOrFail();

        $this->flagshipTrainer = Trainer::withoutGymScope()->where('gym_id', $this->flagshipGym->id)->where('status', 'active')->firstOrFail();

        // Clear any active sessions or attendances to have predictable clean test state
        TrainingSession::withoutGymScope()->whereIn('member_id', [$this->flagshipMember->id, $this->surabayaMember->id])->update(['status' => 'completed']);
        Attendance::withoutGymScope()->whereIn('member_id', [$this->flagshipMember->id, $this->surabayaMember->id])->update(['status' => 'checked_out', 'check_out_at' => now()]);

        // Ensure trainer has schedule today
        TrainerSchedule::firstOrCreate([
            'gym_id' => $this->flagshipGym->id,
            'trainer_id' => $this->flagshipTrainer->id,
            'day_of_week' => now()->dayOfWeek,
        ], [
            'start_time' => '00:00:00',
            'end_time' => '23:59:59',
            'status' => 'active',
        ]);
    }

    public function test_member_login_with_valid_credentials_returns_token(): void
    {
        $response = $this->postJson(route('api.member.login'), [
            'identifier' => $this->flagshipMember->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'token',
                'member' => ['id', 'member_number', 'first_name', 'last_name', 'email'],
                'gym' => ['id', 'name', 'code'],
            ],
        ]);

        $token = $response->json('data.token');
        $this->assertNotEmpty($token);
        $this->assertDatabaseHas('member_tokens', [
            'member_id' => $this->flagshipMember->id,
            'gym_id' => $this->flagshipGym->id,
        ]);
    }

    public function test_member_login_with_invalid_credentials_is_rejected(): void
    {
        $response = $this->postJson(route('api.member.login'), [
            'identifier' => $this->flagshipMember->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['identifier']);
    }

    public function test_inactive_or_suspended_member_login_is_rejected(): void
    {
        $suspendedMember = Member::withoutGymScope()->where('email', 'reza.rahadian@example.com')->firstOrFail();

        $response = $this->postJson(route('api.member.login'), [
            'identifier' => $suspendedMember->email,
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    public function test_member_logout_invalidates_token(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');
        $plainToken = $tokenData['plainTextToken'];

        $response = $this->withHeader('Authorization', 'Bearer ' . $plainToken)
            ->postJson(route('api.member.logout'));

        $response->assertOk();
        $this->assertDatabaseMissing('member_tokens', ['id' => $tokenData['token']->id]);

        // Accessing me endpoint with deleted token returns 401
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $plainToken)
            ->getJson(route('api.member.me'));

        $meResponse->assertStatus(401);
    }

    public function test_unauthenticated_request_is_rejected_with_401(): void
    {
        $response = $this->getJson(route('api.member.dashboard'));
        $response->assertStatus(401);
    }

    public function test_member_me_returns_profile_and_gym_details(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.me'));

        $response->assertOk();
        $response->assertJsonPath('data.member.member_number', $this->flagshipMember->member_number);
        $response->assertJsonPath('data.gym.code', $this->flagshipGym->code);
    }

    public function test_member_dashboard_returns_all_aggregated_metrics(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.dashboard'));

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'data' => [
                'member',
                'gym',
                'membership',
                'active_attendance',
                'active_workout_session',
                'recent_attendances',
            ],
        ]);
    }

    public function test_member_membership_returns_plan_and_quota_breakdown(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.membership'));

        $response->assertOk();
        $response->assertJsonPath('data.has_active', true);
        $response->assertJsonStructure([
            'data' => [
                'membership' => [
                    'id',
                    'plan',
                    'price',
                    'status',
                    'trainer_quota' => ['total', 'used', 'remaining'],
                ],
            ],
        ]);
    }

    public function test_member_qr_returns_verifiable_qr_payload(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.qr'));

        $response->assertOk();
        $response->assertJsonPath('data.member_number', $this->flagshipMember->member_number);
        $response->assertJsonPath('data.gym_code', $this->flagshipGym->code);
        $this->assertNotEmpty($response->json('data.qr_payload'));
    }

    public function test_member_check_in_creates_attendance_with_app_source(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), [
                'source' => 'app',
                'device_identifier' => 'flutter_device_001',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.attendance.source', 'app');
        $response->assertJsonPath('data.attendance.member_id', $this->flagshipMember->id);
    }

    public function test_member_duplicate_active_check_in_is_rejected(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        // 1st check-in
        $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app'])
            ->assertStatus(201);

        // 2nd check-in while in gym
        $dupResponse = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);

        $dupResponse->assertStatus(422);
    }

    public function test_member_can_start_workout_session_and_complete_with_trainer(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        // Check in
        $checkInResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);

        $attendanceId = $checkInResp->json('data.attendance.id');
        $initialQuotaUsed = $this->flagshipMember->activeMembership->trainer_quota_used;

        // Start workout session with trainer
        $startResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $attendanceId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
                'trainer_id' => $this->flagshipTrainer->id,
                'notes' => 'Push day focus',
            ]);

        $startResp->assertStatus(201);
        $sessionId = $startResp->json('data.id');

        // Complete session
        $completeResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.complete', ['workoutSession' => $sessionId]), [
                'notes' => 'Chest & Triceps completed',
            ]);

        $completeResp->assertOk();
        $completeResp->assertJsonPath('data.status', 'completed');

        // Check quota was consumed server-side
        $this->flagshipMember->activeMembership->refresh();
        $this->assertSame($initialQuotaUsed + 1, $this->flagshipMember->activeMembership->trainer_quota_used);
    }

    public function test_member_workout_cancellation_does_not_consume_trainer_quota(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        // Check in
        $checkInResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);

        $attendanceId = $checkInResp->json('data.attendance.id');
        $initialQuotaUsed = $this->flagshipMember->activeMembership->trainer_quota_used;

        // Start session
        $startResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $attendanceId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
                'trainer_id' => $this->flagshipTrainer->id,
            ]);

        $sessionId = $startResp->json('data.id');

        // Cancel session
        $cancelResp = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.cancel', ['workoutSession' => $sessionId]), [
                'reason' => 'Feeling dizzy',
            ]);

        $cancelResp->assertOk();
        $cancelResp->assertJsonPath('data.status', 'cancelled');

        // Quota NOT consumed
        $this->flagshipMember->activeMembership->refresh();
        $this->assertSame($initialQuotaUsed, $this->flagshipMember->activeMembership->trainer_quota_used);
    }

    public function test_cross_tenant_member_access_is_strictly_blocked(): void
    {
        $jktToken = $this->flagshipMember->createToken('mobile_app');
        $sbyToken = $this->surabayaMember->createToken('mobile_app');

        // Jakarta member check in
        $jktCheckIn = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);

        $jktAttendanceId = $jktCheckIn->json('data.attendance.id');

        // Start JKT session
        $jktSession = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $jktAttendanceId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
            ]);

        $jktSessionId = $jktSession->json('data.id');

        // Surabaya member attempts to complete Jakarta member's workout session -> 403 Forbidden
        $sbyAttempt = $this->withHeader('Authorization', 'Bearer ' . $sbyToken['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.complete', ['workoutSession' => $jktSessionId]));

        $sbyAttempt->assertStatus(403);
    }
}
