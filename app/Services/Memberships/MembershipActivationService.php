<?php

namespace App\Services\Memberships;

use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Services\Audit\AuditService;
use App\Services\Members\MemberService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MembershipActivationService
{
    public function __construct(
        protected MemberService $memberService,
        protected MembershipService $membershipService,
        protected AuditService $auditService
    ) {}

    /**
     * Atomically activate a paid registration, creating/reusing Member and Membership.
     */
    public function activateRegistration(MembershipRegistration $registration): MembershipRegistration
    {
        return DB::transaction(function () use ($registration) {
            /** @var MembershipRegistration $lockedReg */
            $lockedReg = MembershipRegistration::withoutGymScope()
                ->where('id', $registration->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotency check: If already activated with member linked, return safely
            if ($lockedReg->member_id && $lockedReg->membership_id && in_array($lockedReg->status, ['approved', 'activated'], true)) {
                return $lockedReg->fresh(['membershipPlan', 'gym', 'member', 'membership']);
            }

            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $lockedReg->gym_id)
                ->where('id', $lockedReg->membership_plan_id)
                ->first();

            if (! $plan) {
                Log::error('Activation failed: Plan not found', ['registration_id' => $lockedReg->id]);
                throw new \RuntimeException('Membership plan not found for registration.');
            }

            $email = strtolower(trim($lockedReg->email));
            $phone = trim($lockedReg->phone);

            // 1. Find existing member in this tenant or create a new one
            $member = Member::withoutGymScope()
                ->where('gym_id', $lockedReg->gym_id)
                ->where(function ($q) use ($email, $phone) {
                    if ($email) {
                        $q->where('email', $email);
                    }
                    if ($phone) {
                        $q->orWhere('phone', $phone);
                    }
                })
                ->first();

            if (! $member) {
                $fullName = trim($lockedReg->full_name);
                $nameParts = explode(' ', $fullName, 2);
                $firstName = $nameParts[0];
                $lastName = $nameParts[1] ?? null;

                $emergencyContact = null;
                if ($lockedReg->emergency_contact_name || $lockedReg->emergency_contact_phone) {
                    $emergencyContact = [
                        'name' => $lockedReg->emergency_contact_name,
                        'phone' => $lockedReg->emergency_contact_phone,
                        'relationship' => $lockedReg->emergency_contact_relationship,
                    ];
                }

                $member = $this->memberService->createMember(
                    data: [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'email' => $lockedReg->email,
                        'phone' => $lockedReg->phone,
                        'password' => 'password', // Default member password
                        'date_of_birth' => $lockedReg->date_of_birth?->format('Y-m-d'),
                        'gender' => $lockedReg->gender,
                        'address' => $lockedReg->address,
                        'emergency_contact' => $emergencyContact,
                        'status' => 'active',
                    ],
                    photo: null,
                    gymId: $lockedReg->gym_id
                );
            } else {
                // Reactivate existing member if inactive
                if ($member->status === 'inactive') {
                    $member->update(['status' => 'active']);
                }
            }

            // 2. Create active Membership
            $membership = $this->membershipService->createMembership(
                data: [
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => now()->format('Y-m-d'),
                    'status' => 'active',
                    'payment_status' => 'paid',
                    'notes' => "Online Registration Payment Confirmed (#{$lockedReg->registration_number})",
                ],
                gymId: $lockedReg->gym_id
            );

            // 3. Update registration record
            $lockedReg->update([
                'status' => 'approved',
                'payment_status' => 'paid',
                'member_id' => $member->id,
                'membership_id' => $membership->id,
                'reviewed_at' => now(),
            ]);

            // 4. Audit trail
            $this->auditService->log(
                action: 'registration.online_activated',
                entityType: MembershipRegistration::class,
                entityId: $lockedReg->id,
                metadata: [
                    'registration_number' => $lockedReg->registration_number,
                    'member_id' => $member->id,
                    'member_number' => $member->member_number,
                    'membership_id' => $membership->id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'price' => $plan->price,
                ],
                gymId: $lockedReg->gym_id
            );

            Log::info('Membership Registration Activated', [
                'registration_number' => $lockedReg->registration_number,
                'member_number' => $member->member_number,
                'membership_id' => $membership->id,
            ]);

            return $lockedReg->fresh(['membershipPlan', 'gym', 'member', 'membership']);
        });
    }
}
