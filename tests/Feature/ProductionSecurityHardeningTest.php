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

class ProductionSecurityHardeningTest extends TestCase
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

        // Reset attendance/sessions state
        TrainingSession::withoutGymScope()->whereIn('member_id', [$this->flagshipMember->id, $this->surabayaMember->id])->update(['status' => 'completed']);
        Attendance::withoutGymScope()->whereIn('member_id', [$this->flagshipMember->id, $this->surabayaMember->id])->update(['status' => 'checked_out', 'check_out_at' => now()]);

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

    public function test_member_login_rate_limiting_protects_against_brute_force(): void
    {
        // Attempt 5 logins
        for ($i = 0; $i < 5; $i++) {
            $this->postJson(route('api.member.login'), [
                'identifier' => 'nonexistent@example.com',
                'password' => 'wrong',
            ]);
        }

        // 6th attempt within the same minute should receive 429 Too Many Requests
        $response = $this->postJson(route('api.member.login'), [
            'identifier' => 'nonexistent@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(429);
    }

    public function test_expired_token_is_rejected(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app', now()->subMinutes(10));

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.me'));

        $response->assertStatus(401);
    }

    public function test_suspended_member_token_is_forbidden(): void
    {
        $suspendedMember = Member::withoutGymScope()->where('email', 'reza.rahadian@example.com')->firstOrFail();
        $tokenData = $suspendedMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->getJson(route('api.member.me'));

        $response->assertStatus(403);
    }

    public function test_member_cannot_complete_another_members_session(): void
    {
        $jktToken = $this->flagshipMember->createToken('mobile_app');
        $sbyToken = $this->surabayaMember->createToken('mobile_app');

        // Check in Arya
        $checkIn = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);
        $attId = $checkIn->json('data.attendance.id');

        // Start workout for Arya
        $start = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $attId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
            ]);
        $sessionId = $start->json('data.id');

        // Budi (Surabaya member) attempts to complete Arya's session -> 403 Forbidden
        $response = $this->withHeader('Authorization', 'Bearer ' . $sbyToken['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.complete', ['workoutSession' => $sessionId]));

        $response->assertStatus(403);
    }

    public function test_member_cannot_cancel_another_members_session(): void
    {
        $jktToken = $this->flagshipMember->createToken('mobile_app');
        $sbyToken = $this->surabayaMember->createToken('mobile_app');

        // Check in Arya
        $checkIn = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);
        $attId = $checkIn->json('data.attendance.id');

        // Start workout
        $start = $this->withHeader('Authorization', 'Bearer ' . $jktToken['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $attId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
            ]);
        $sessionId = $start->json('data.id');

        // Budi attempts to cancel Arya's session -> 403 Forbidden
        $response = $this->withHeader('Authorization', 'Bearer ' . $sbyToken['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.cancel', ['workoutSession' => $sessionId]));

        $response->assertStatus(403);
    }

    public function test_valid_hmac_qr_payload_is_verified_and_accepted(): void
    {
        $issuedAt = now()->timestamp;
        $gymCode = $this->flagshipGym->code;
        $memberNumber = $this->flagshipMember->member_number;

        $validPayload = json_encode([
            'type' => 'EXFITS_MEMBER_QR',
            'gym' => $gymCode,
            'member' => $memberNumber,
            'issued_at' => $issuedAt,
            'hash' => hash_hmac('sha256', "{$memberNumber}:{$gymCode}:{$issuedAt}", config('app.key')),
        ]);

        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), [
                'member_number' => $validPayload,
                'source' => 'kiosk',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.member.member_number', $memberNumber);
    }

    public function test_forged_hmac_qr_payload_is_rejected(): void
    {
        $issuedAt = now()->timestamp;
        $gymCode = $this->flagshipGym->code;
        $memberNumber = $this->flagshipMember->member_number;

        $forgedPayload = json_encode([
            'type' => 'EXFITS_MEMBER_QR',
            'gym' => $gymCode,
            'member' => $memberNumber,
            'issued_at' => $issuedAt,
            'hash' => 'forged_fake_hash_1234567890abcdef',
        ]);

        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), [
                'member_number' => $forgedPayload,
                'source' => 'kiosk',
            ]);

        $response->assertStatus(422);
    }

    public function test_quota_deduction_is_idempotent_and_cannot_double_deduct(): void
    {
        $tokenData = $this->flagshipMember->createToken('mobile_app');

        $checkIn = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.attendance.checkin'), ['source' => 'app']);
        $attId = $checkIn->json('data.attendance.id');

        $start = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->postJson(route('api.member.workout-sessions.store'), [
                'attendance_id' => $attId,
                'workout_type_id' => $this->flagshipWorkoutType->id,
                'trainer_id' => $this->flagshipTrainer->id,
            ]);
        $sessionId = $start->json('data.id');

        $initialUsed = $this->flagshipMember->activeMembership->trainer_quota_used;

        // 1st completion
        $comp1 = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.complete', ['workoutSession' => $sessionId]));
        $comp1->assertOk();

        // 2nd completion attempt on already completed session -> 422
        $comp2 = $this->withHeader('Authorization', 'Bearer ' . $tokenData['plainTextToken'])
            ->patchJson(route('api.member.workout-sessions.complete', ['workoutSession' => $sessionId]));
        $comp2->assertStatus(422);

        $this->flagshipMember->activeMembership->refresh();
        $this->assertSame($initialUsed + 1, $this->flagshipMember->activeMembership->trainer_quota_used);
    }
}
