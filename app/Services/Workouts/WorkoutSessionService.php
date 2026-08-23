<?php

namespace App\Services\Workouts;

use App\Models\Attendance;
use App\Models\Membership;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use App\Services\Trainer\TrainerAvailabilityService;
use App\Services\Trainer\TrainerQuotaService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkoutSessionService
{
    public function __construct(
        protected AuditService $auditService,
        protected GymContext $gymContext,
        protected TrainerAvailabilityService $trainerAvailabilityService,
        protected TrainerQuotaService $trainerQuotaService
    ) {}

    /**
     * Create a new training session attached to an active attendance.
     *
     * @throws ValidationException
     */
    public function createSession(
        int $attendanceId,
        int $workoutTypeId,
        ?int $trainerId = null,
        ?string $notes = null,
        ?int $gymId = null
    ): TrainingSession {
        return DB::transaction(function () use ($attendanceId, $workoutTypeId, $trainerId, $notes, $gymId) {
            $effectiveGymId = $gymId ?? $this->gymContext->getGymId() ?? auth()->user()?->gym_id;

            if (! $effectiveGymId) {
                throw ValidationException::withMessages([
                    'gym_id' => 'Gym context tidak teridentifikasi.',
                ]);
            }

            // 1. Resolve & validate Attendance
            $attendance = Attendance::withoutGymScope()
                ->where('id', $attendanceId)
                ->lockForUpdate()
                ->first();

            if (! $attendance) {
                throw ValidationException::withMessages([
                    'attendance_id' => 'Data attendance tidak ditemukan.',
                ]);
            }

            if ($attendance->gym_id !== (int) $effectiveGymId) {
                throw ValidationException::withMessages([
                    'attendance_id' => 'Attendance tidak terdaftar pada gym ini.',
                ]);
            }

            if ($attendance->status !== 'in_gym' || $attendance->check_out_at !== null) {
                throw ValidationException::withMessages([
                    'attendance_id' => 'Attendance sudah tidak aktif.',
                ]);
            }

            // 2. Resolve & validate Workout Type
            $workoutType = WorkoutType::withoutGymScope()
                ->where('id', $workoutTypeId)
                ->first();

            if (! $workoutType) {
                throw ValidationException::withMessages([
                    'workout_type_id' => 'Jenis workout tidak ditemukan.',
                ]);
            }

            if ($workoutType->gym_id !== (int) $effectiveGymId) {
                throw ValidationException::withMessages([
                    'workout_type_id' => 'Workout type tidak terdaftar pada gym ini.',
                ]);
            }

            if ($workoutType->status !== 'active') {
                throw ValidationException::withMessages([
                    'workout_type_id' => 'Workout type tidak aktif.',
                ]);
            }

            // 3. Prevent duplicate active session for the same workout type during this visit
            $duplicateActive = TrainingSession::withoutGymScope()
                ->where('attendance_id', $attendance->id)
                ->where('workout_type_id', $workoutType->id)
                ->where('status', 'in_progress')
                ->lockForUpdate()
                ->first();

            if ($duplicateActive) {
                throw ValidationException::withMessages([
                    'workout_type_id' => 'Sesi workout jenis ini sedang aktif berjalan untuk kunjungan ini.',
                ]);
            }

            // 4. Validate Trainer and Quota if trainer is selected
            if ($trainerId !== null) {
                $this->trainerAvailabilityService->validateTrainerSelection(
                    trainerId: $trainerId,
                    gymId: (int) $effectiveGymId,
                    dateTime: Carbon::now(),
                    enforceSchedule: false // Optional scheduling rule
                );

                // Verify member has active membership with remaining quota
                if ($attendance->membership_id) {
                    $membership = Membership::withoutGymScope()
                        ->where('id', $attendance->membership_id)
                        ->first();

                    if (! $membership || ! $this->trainerQuotaService->hasAvailableQuota($membership)) {
                        throw ValidationException::withMessages([
                            'trainer_id' => 'Membership member tidak memiliki sisa quota trainer.',
                        ]);
                    }
                } else {
                    throw ValidationException::withMessages([
                        'trainer_id' => 'Pemilihan trainer membutuhkan membership aktif.',
                    ]);
                }
            }

            // 5. Create Training Session
            $session = TrainingSession::withoutGymScope()->create([
                'gym_id' => $effectiveGymId,
                'attendance_id' => $attendance->id,
                'member_id' => $attendance->member_id,
                'membership_id' => $attendance->membership_id,
                'workout_type_id' => $workoutType->id,
                'trainer_id' => $trainerId,
                'started_at' => Carbon::now(),
                'completed_at' => null,
                'trainer_quota_consumed_at' => null,
                'status' => 'in_progress',
                'notes' => $notes,
            ]);

            // 6. Audit Logging
            $this->auditService->log(
                action: 'training_session.created',
                entityType: 'training_session',
                entityId: $session->id,
                metadata: [
                    'gym_id' => $effectiveGymId,
                    'attendance_id' => $attendance->id,
                    'member_id' => $attendance->member_id,
                    'membership_id' => $attendance->membership_id,
                    'workout_type_id' => $workoutType->id,
                    'trainer_id' => $trainerId,
                    'status' => 'in_progress',
                    'started_at' => $session->started_at->toIso8601String(),
                ]
            );

            return $session->load(['member', 'attendance', 'workoutType', 'trainer', 'membership.membershipPlan', 'gym']);
        });
    }

    /**
     * Complete an in-progress workout session.
     *
     * @throws ValidationException
     */
    public function completeSession(int|TrainingSession $session, ?string $notes = null): TrainingSession
    {
        return DB::transaction(function () use ($session, $notes) {
            $record = is_int($session)
                ? TrainingSession::withoutGymScope()->where('id', $session)->lockForUpdate()->firstOrFail()
                : TrainingSession::withoutGymScope()->where('id', $session->id)->lockForUpdate()->firstOrFail();

            if ($record->status !== 'in_progress') {
                throw ValidationException::withMessages([
                    'status' => 'Hanya sesi yang sedang aktif (in_progress) yang dapat diselesaikan.',
                ]);
            }

            $oldStatus = $record->status;
            $record->completed_at = Carbon::now();
            $record->status = 'completed';

            if ($notes) {
                $record->notes = $notes;
            }

            $record->save();

            // Deduct trainer quota if session has an assigned trainer and was not yet consumed
            if ($record->trainer_id !== null) {
                $this->trainerQuotaService->consumeForTrainingSession($record);
            }

            $this->auditService->log(
                action: 'training_session.completed',
                entityType: 'training_session',
                entityId: $record->id,
                metadata: [
                    'old_status' => $oldStatus,
                    'status' => 'completed',
                    'completed_at' => $record->completed_at->toIso8601String(),
                    'trainer_id' => $record->trainer_id,
                    'trainer_quota_consumed_at' => $record->trainer_quota_consumed_at?->toIso8601String(),
                    'duration_minutes' => $record->duration_in_minutes,
                ]
            );

            return $record->load(['member', 'attendance', 'workoutType', 'trainer', 'membership.membershipPlan', 'gym']);
        });
    }

    /**
     * Cancel a workout session.
     *
     * @throws ValidationException
     */
    public function cancelSession(int|TrainingSession $session, ?string $reason = null): TrainingSession
    {
        return DB::transaction(function () use ($session, $reason) {
            $record = is_int($session)
                ? TrainingSession::withoutGymScope()->where('id', $session)->lockForUpdate()->firstOrFail()
                : TrainingSession::withoutGymScope()->where('id', $session->id)->lockForUpdate()->firstOrFail();

            if ($record->status === 'completed') {
                throw ValidationException::withMessages([
                    'status' => 'Sesi workout yang sudah selesai (completed) tidak dapat dibatalkan.',
                ]);
            }

            $oldStatus = $record->status;
            $record->status = 'cancelled';

            if ($reason) {
                $record->notes = trim(($record->notes ? $record->notes . "\n" : '') . "Cancelled: " . $reason);
            }

            $record->save();

            $this->auditService->log(
                action: 'training_session.cancelled',
                entityType: 'training_session',
                entityId: $record->id,
                metadata: [
                    'old_status' => $oldStatus,
                    'status' => 'cancelled',
                    'reason' => $reason,
                ]
            );

            return $record->load(['member', 'attendance', 'workoutType', 'trainer', 'membership.membershipPlan', 'gym']);
        });
    }
}