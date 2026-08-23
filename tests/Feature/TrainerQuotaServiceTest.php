<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Trainer;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use App\Services\Trainer\TrainerQuotaService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class TrainerQuotaServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_quota_summary_returns_correct_totals(): void
    {
        /** @var TrainerQuotaService $service */
        $service = app(TrainerQuotaService::class);

        $membership = Membership::withoutGymScope()->where('trainer_quota_total', '>', 0)->first();
        $summary = $service->getQuotaSummary($membership);

        $this->assertEquals($membership->trainer_quota_total, $summary['total']);
        $this->assertEquals($membership->trainer_quota_used, $summary['used']);
        $this->assertEquals($membership->trainer_quota_total - $membership->trainer_quota_used, $summary['remaining']);
        $this->assertTrue($summary['has_quota']);
    }

    public function test_consume_for_training_session_deducts_quota_and_sets_timestamp(): void
    {
        /** @var TrainerQuotaService $service */
        $service = app(TrainerQuotaService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $membership = Membership::withoutGymScope()->where('member_id', $member->id)->where('status', 'active')->first();
        $initialUsed = $membership->trainer_quota_used;

        $session = TrainingSession::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'attendance_id' => 1,
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'workout_type_id' => WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first()->id,
            'trainer_id' => $trainer->id,
            'started_at' => now()->subHour(),
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        $consumed = $service->consumeForTrainingSession($session);
        $this->assertTrue($consumed);

        $session->refresh();
        $membership->refresh();

        $this->assertNotNull($session->trainer_quota_consumed_at);
        $this->assertEquals($initialUsed + 1, $membership->trainer_quota_used);
    }

    public function test_consumption_is_idempotent_and_prevents_double_deduction(): void
    {
        /** @var TrainerQuotaService $service */
        $service = app(TrainerQuotaService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $membership = Membership::withoutGymScope()->where('member_id', $member->id)->where('status', 'active')->first();
        $initialUsed = $membership->trainer_quota_used;

        $session = TrainingSession::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'attendance_id' => 1,
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'workout_type_id' => WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first()->id,
            'trainer_id' => $trainer->id,
            'started_at' => now()->subHour(),
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        // First call
        $firstResult = $service->consumeForTrainingSession($session);
        $this->assertTrue($firstResult);
        $membership->refresh();
        $this->assertEquals($initialUsed + 1, $membership->trainer_quota_used);

        // Second call on same session (idempotency check)
        $secondResult = $service->consumeForTrainingSession($session);
        $this->assertTrue($secondResult); // Returns true as already consumed
        $membership->refresh();
        $this->assertEquals($initialUsed + 1, $membership->trainer_quota_used); // Quota remains incremented by 1 only!
    }

    public function test_consumption_throws_when_quota_exhausted(): void
    {
        /** @var TrainerQuotaService $service */
        $service = app(TrainerQuotaService::class);

        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $trainer = Trainer::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('status', 'active')->first();
        $member = Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $membership = Membership::withoutGymScope()->where('member_id', $member->id)->where('status', 'active')->first();

        // Exhaust quota
        $membership->update([
            'trainer_quota_total' => 2,
            'trainer_quota_used' => 2,
        ]);

        $session = TrainingSession::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'attendance_id' => 1,
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'workout_type_id' => WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->first()->id,
            'trainer_id' => $trainer->id,
            'started_at' => now()->subHour(),
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        $this->expectException(ValidationException::class);
        $service->consumeForTrainingSession($session);
    }
}
