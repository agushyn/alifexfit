<?php

namespace App\Services\Trainer;

use App\Models\Membership;
use App\Models\TrainingSession;
use App\Services\Audit\AuditService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TrainerQuotaService
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    /**
     * Get remaining trainer quota for a membership.
     */
    public function getRemainingQuota(Membership $membership): int
    {
        return max(0, (int) $membership->trainer_quota_total - (int) $membership->trainer_quota_used);
    }

    /**
     * Check if membership has available trainer quota.
     */
    public function hasAvailableQuota(Membership $membership): bool
    {
        return $this->getRemainingQuota($membership) > 0;
    }

    /**
     * Consume 1 trainer quota unit for a completed training session.
     * Concurrency-safe, transactional, and idempotent.
     *
     * @throws ValidationException
     */
    public function consumeForTrainingSession(TrainingSession $session): bool
    {
        // 1. If no trainer is assigned, no quota is consumed
        if (! $session->trainer_id) {
            return false;
        }

        // 2. Idempotency: If quota was already consumed for this session, do not deduct again
        if ($session->trainer_quota_consumed_at !== null) {
            return true;
        }

        if (! $session->membership_id) {
            throw ValidationException::withMessages([
                'trainer_quota' => 'Sesi workout trainer membutuhkan membership aktif.',
            ]);
        }

        return DB::transaction(function () use ($session) {
            // 3. Lock Membership row for update to prevent concurrent race condition over-consumption
            $membership = Membership::withoutGymScope()
                ->where('id', $session->membership_id)
                ->lockForUpdate()
                ->first();

            if (! $membership) {
                throw ValidationException::withMessages([
                    'membership' => 'Data membership tidak ditemukan.',
                ]);
            }

            if ((int) $membership->gym_id !== (int) $session->gym_id) {
                throw ValidationException::withMessages([
                    'membership' => 'Membership tidak terdaftar pada tenant gym yang sesuai.',
                ]);
            }

            // 4. Double check session quota marker inside transaction
            $currentSession = TrainingSession::withoutGymScope()
                ->where('id', $session->id)
                ->lockForUpdate()
                ->first();

            if ($currentSession && $currentSession->trainer_quota_consumed_at !== null) {
                return true;
            }

            // 5. Verify remaining quota > 0
            $remaining = (int) $membership->trainer_quota_total - (int) $membership->trainer_quota_used;
            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'trainer_quota' => 'Quota sesi personal trainer pada membership ini sudah habis.',
                ]);
            }

            // 6. Deduct quota atomically
            $oldUsed = $membership->trainer_quota_used;
            $membership->trainer_quota_used = $oldUsed + 1;
            $membership->save();

            // 7. Stamp consumption on training session
            $now = Carbon::now();
            $session->trainer_quota_consumed_at = $now;
            $session->save();

            // 8. Audit Log
            $this->auditService->log(
                action: 'trainer_quota.consumed',
                entityType: 'training_session',
                entityId: $session->id,
                metadata: [
                    'gym_id' => $session->gym_id,
                    'member_id' => $session->member_id,
                    'membership_id' => $membership->id,
                    'trainer_id' => $session->trainer_id,
                    'quota_total' => $membership->trainer_quota_total,
                    'quota_used_before' => $oldUsed,
                    'quota_used_after' => $membership->trainer_quota_used,
                    'consumed_at' => $now->toIso8601String(),
                ]
            );

            return true;
        });
    }

    /**
     * Audited reversal of consumed quota if explicitly required.
     */
    public function releaseForTrainingSession(TrainingSession $session): bool
    {
        if ($session->trainer_quota_consumed_at === null || ! $session->membership_id) {
            return false;
        }

        return DB::transaction(function () use ($session) {
            $membership = Membership::withoutGymScope()
                ->where('id', $session->membership_id)
                ->lockForUpdate()
                ->first();

            if ($membership && $membership->trainer_quota_used > 0) {
                $oldUsed = $membership->trainer_quota_used;
                $membership->trainer_quota_used = max(0, $oldUsed - 1);
                $membership->save();
            }

            $session->trainer_quota_consumed_at = null;
            $session->save();

            $this->auditService->log(
                action: 'trainer_quota.released',
                entityType: 'training_session',
                entityId: $session->id,
                metadata: [
                    'gym_id' => $session->gym_id,
                    'member_id' => $session->member_id,
                    'membership_id' => $session->membership_id,
                    'trainer_id' => $session->trainer_id,
                ]
            );

            return true;
        });
    }

    /**
     * Get summary array of quota.
     */
    public function getQuotaSummary(Membership $membership): array
    {
        $total = (int) $membership->trainer_quota_total;
        $used = (int) $membership->trainer_quota_used;
        $remaining = max(0, $total - $used);

        return [
            'total' => $total,
            'used' => $used,
            'remaining' => $remaining,
            'has_available' => $remaining > 0,
            'has_quota' => $remaining > 0,
        ];
    }
}
