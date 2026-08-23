<?php

namespace App\Services\Memberships;

use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Services\Tenancy\GymContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MembershipService
{
    public function __construct(
        protected GymContext $gymContext
    ) {}

    /**
     * Calculate the authoritative end date for a plan given a start date.
     */
    public function calculateEndDate(Carbon $startDate, MembershipPlan $plan): Carbon
    {
        $duration = max(1, (int) $plan->duration);

        return match ($plan->billing_period) {
            'monthly' => $startDate->copy()->addMonths($duration)->subDay(),
            'quarterly' => $startDate->copy()->addMonths(3 * $duration)->subDay(),
            'yearly' => $startDate->copy()->addYears($duration)->subDay(),
            'custom' => $startDate->copy()->addDays($duration)->subDay(),
            default => $startDate->copy()->addMonths($duration)->subDay(),
        };
    }

    /**
     * Create a new membership with authoritative price snapshot, trainer quota, and tenant validation.
     */
    public function createMembership(array $data, ?int $gymId = null): Membership
    {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

        if (!$resolvedGymId) {
            throw new \InvalidArgumentException('A valid tenant gym context is required to create a membership.');
        }

        /** @var Member $member */
        $member = Member::withoutGymScope()->findOrFail($data['member_id']);

        /** @var MembershipPlan $plan */
        $plan = MembershipPlan::withoutGymScope()->findOrFail($data['membership_plan_id']);

        // Strict cross-gym validation
        if ((int) $member->gym_id !== (int) $resolvedGymId || (int) $plan->gym_id !== (int) $resolvedGymId) {
            throw new \InvalidArgumentException('Member and Membership Plan must belong to the active tenant gym.');
        }

        $startDate = Carbon::parse($data['start_date']);
        $endDate = !empty($data['end_date'])
            ? Carbon::parse($data['end_date'])
            : $this->calculateEndDate($startDate, $plan);

        if ($endDate->lt($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => 'End date cannot be prior to start date.',
            ]);
        }

        $requestedStatus = $data['status'] ?? ($startDate->isFuture() ? 'pending' : 'active');

        // Overlapping active membership validation
        if ($requestedStatus === 'active') {
            $hasOverlap = Membership::withoutGymScope()
                ->where('gym_id', $resolvedGymId)
                ->where('member_id', $member->id)
                ->where('status', 'active')
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('start_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                        ->orWhereBetween('end_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                        ->orWhere(function ($sub) use ($startDate, $endDate) {
                            $sub->where('start_date', '<=', $startDate->format('Y-m-d'))
                                ->where('end_date', '>=', $endDate->format('Y-m-d'));
                        });
                })
                ->exists();

            if ($hasOverlap) {
                throw ValidationException::withMessages([
                    'member_id' => 'This member already has an active membership during the selected period.',
                ]);
            }
        }

        return DB::transaction(function () use ($resolvedGymId, $member, $plan, $startDate, $endDate, $requestedStatus, $data) {
            // Authoritative snapshot of price and trainer quota from the plan
            $membership = Membership::create([
                'gym_id' => $resolvedGymId,
                'member_id' => $member->id,
                'membership_plan_id' => $plan->id,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => $requestedStatus,
                'price' => $plan->price, // Authoritative price snapshot
                'payment_status' => $data['payment_status'] ?? 'paid',
                'trainer_quota_total' => $plan->trainer_quota, // Authoritative quota snapshot
                'trainer_quota_used' => 0,
                'notes' => $data['notes'] ?? null,
            ]);

            return $membership;
        });
    }

    /**
     * Update an existing membership record.
     */
    public function updateMembership(Membership $membership, array $data): Membership
    {
        return DB::transaction(function () use ($membership, $data) {
            $updateData = [];

            if (isset($data['status'])) {
                $updateData['status'] = $data['status'];
            }

            if (isset($data['payment_status'])) {
                $updateData['payment_status'] = $data['payment_status'];
            }

            if (isset($data['start_date'])) {
                $updateData['start_date'] = $data['start_date'];
            }

            if (isset($data['end_date'])) {
                $updateData['end_date'] = $data['end_date'];
            }

            if (array_key_exists('notes', $data)) {
                $updateData['notes'] = $data['notes'];
            }

            $membership->update($updateData);

            return $membership->fresh(['member', 'membershipPlan', 'gym']);
        });
    }
}