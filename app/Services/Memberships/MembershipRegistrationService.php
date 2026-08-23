<?php

namespace App\Services\Memberships;

use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Members\MemberService;
use App\Services\MembershipRegistrationNumberGenerator;
use App\Services\Tenancy\GymContext;
use App\Services\Storage\SecureStorageService;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MembershipRegistrationService
{
    public function __construct(
        protected MembershipRegistrationNumberGenerator $registrationNumberGenerator,
        protected MemberService $memberService,
        protected MembershipService $membershipService,
        protected MembershipActivationService $activationService,
        protected SecureStorageService $storageService,
        protected AuditService $auditService,
        protected GymContext $gymContext
    ) {}

    /**
     * Create a new online/admin membership registration application.
     */
    public function createRegistration(
        array $data,
        ?UploadedFile $ktp = null,
        ?int $gymId = null,
        string $source = 'website'
    ): MembershipRegistration {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

        if (! $resolvedGymId) {
            throw new \InvalidArgumentException('A valid tenant gym context is required to register.');
        }

        // Validate plan exists and belongs to this gym and is active
        $plan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $resolvedGymId)
            ->where('id', $data['membership_plan_id'])
            ->where('status', 'active')
            ->first();

        if (! $plan) {
            throw ValidationException::withMessages([
                'membership_plan_id' => 'The selected membership plan is invalid or not active for this gym.',
            ]);
        }

        $email = strtolower(trim($data['email']));
        $phone = trim($data['phone']);

        // Duplicate pending registration protection (Tenant scoped)
        $existingPending = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $resolvedGymId)
            ->where('status', 'pending')
            ->where(function ($q) use ($email, $phone) {
                $q->where('email', $email)
                    ->orWhere('phone', $phone);
            })
            ->exists();

        if ($existingPending) {
            throw ValidationException::withMessages([
                'email' => 'Anda sudah memiliki pendaftaran yang sedang diproses oleh tim kami.',
            ]);
        }

        $ktpPath = null;
        $ktpOriginalName = null;
        if ($ktp) {
            $ktpOriginalName = $ktp->getClientOriginalName();
            $ktpPath = $this->storageService->storePrivate($ktp, 'ktp', $resolvedGymId);
        }

        return DB::transaction(function () use ($resolvedGymId, $plan, $data, $email, $phone, $source, $ktpPath, $ktpOriginalName) {
            $regNumber = $this->registrationNumberGenerator->generate($resolvedGymId);

            $registration = MembershipRegistration::create([
                'gym_id' => $resolvedGymId,
                'membership_plan_id' => $plan->id,
                'registration_number' => $regNumber,
                'source' => $source,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'full_name' => trim($data['full_name']),
                'email' => $email,
                'phone' => $phone,
                'gender' => $data['gender'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'ktp_document_path' => $ktpPath,
                'ktp_original_filename' => $ktpOriginalName,
                'ktp_uploaded_at' => $ktpPath ? now() : null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'emergency_contact_relationship' => $data['emergency_contact_relationship'] ?? null,
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);

            $this->auditService->log(
                action: 'registration.created',
                entityType: MembershipRegistration::class,
                entityId: $registration->id,
                metadata: [
                    'registration_number' => $regNumber,
                    'full_name' => $registration->full_name,
                    'email' => $registration->email,
                    'phone' => $registration->phone,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'source' => $source,
                    'has_ktp' => ! empty($ktpPath),
                ],
                gymId: $resolvedGymId
            );

            return $registration->fresh(['membershipPlan', 'gym']);
        });
    }

    /**
     * Approve a pending registration: creates Member & Membership atomically.
     */
    public function approveRegistration(
        MembershipRegistration $registration,
        User $reviewer,
        array $approvalData = []
    ): MembershipRegistration {
        return DB::transaction(function () use ($registration, $reviewer, $approvalData) {
            // Pessimistic row locking to prevent race conditions & duplicate approval
            /** @var MembershipRegistration $lockedReg */
            $lockedReg = MembershipRegistration::withoutGymScope()
                ->where('id', $registration->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedReg->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => "Cannot approve registration in '{$lockedReg->status}' status.",
                ]);
            }

            // Cross-tenant verification
            if (! $reviewer->isSuperAdmin() && (int) $reviewer->gym_id !== (int) $lockedReg->gym_id) {
                throw new \InvalidArgumentException('Reviewer must belong to the same gym as the registration.');
            }

            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $lockedReg->gym_id)
                ->where('id', $lockedReg->membership_plan_id)
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'The selected membership plan is no longer active.',
                ]);
            }

            // 1. Map and Create Member using existing MemberService
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
                    'date_of_birth' => $lockedReg->date_of_birth?->format('Y-m-d'),
                    'gender' => $lockedReg->gender,
                    'address' => $lockedReg->address,
                    'emergency_contact' => $emergencyContact,
                    'status' => 'active',
                ],
                photo: null,
                gymId: $lockedReg->gym_id
            );

            // 2. Create Membership using existing MembershipService
            $startDate = ! empty($approvalData['start_date'])
                ? Carbon::parse($approvalData['start_date'])
                : now();

            $paymentStatus = $approvalData['payment_status'] ?? 'paid';

            $membership = $this->membershipService->createMembership(
                data: [
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $startDate->format('Y-m-d'),
                    'status' => 'active',
                    'payment_status' => $paymentStatus,
                    'notes' => $approvalData['notes'] ?? "Created from online registration #{$lockedReg->registration_number}",
                ],
                gymId: $lockedReg->gym_id
            );

            // 3. Update registration record
            $lockedReg->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'member_id' => $member->id,
                'membership_id' => $membership->id,
                'notes' => ! empty($approvalData['notes'])
                    ? ($lockedReg->notes ? "{$lockedReg->notes}\n{$approvalData['notes']}" : $approvalData['notes'])
                    : $lockedReg->notes,
            ]);

            // 4. Audit logging
            $this->auditService->log(
                action: 'registration.approved',
                entityType: MembershipRegistration::class,
                entityId: $lockedReg->id,
                metadata: [
                    'registration_number' => $lockedReg->registration_number,
                    'member_id' => $member->id,
                    'member_number' => $member->member_number,
                    'membership_id' => $membership->id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'reviewed_by' => $reviewer->id,
                    'reviewer_name' => $reviewer->name,
                ],
                gymId: $lockedReg->gym_id
            );

            return $lockedReg->fresh(['membershipPlan', 'gym', 'member', 'membership', 'reviewer']);
        });
    }

    /**
     * Reject a pending registration with mandatory reason.
     */
    public function rejectRegistration(
        MembershipRegistration $registration,
        User $reviewer,
        string $reason
    ): MembershipRegistration {
        return DB::transaction(function () use ($registration, $reviewer, $reason) {
            /** @var MembershipRegistration $lockedReg */
            $lockedReg = MembershipRegistration::withoutGymScope()
                ->where('id', $registration->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedReg->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => "Cannot reject registration in '{$lockedReg->status}' status.",
                ]);
            }

            if (! $reviewer->isSuperAdmin() && (int) $reviewer->gym_id !== (int) $lockedReg->gym_id) {
                throw new \InvalidArgumentException('Reviewer must belong to the same gym as the registration.');
            }

            $lockedReg->update([
                'status' => 'rejected',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'rejection_reason' => trim($reason),
            ]);

            $this->auditService->log(
                action: 'registration.rejected',
                entityType: MembershipRegistration::class,
                entityId: $lockedReg->id,
                metadata: [
                    'registration_number' => $lockedReg->registration_number,
                    'rejection_reason' => trim($reason),
                    'reviewed_by' => $reviewer->id,
                    'reviewer_name' => $reviewer->name,
                ],
                gymId: $lockedReg->gym_id
            );

            return $lockedReg->fresh(['membershipPlan', 'gym', 'reviewer']);
        });
    }

    /**
     * Cancel a pending registration.
     */
    public function cancelRegistration(
        MembershipRegistration $registration,
        User $user,
        ?string $reason = null
    ): MembershipRegistration {
        return DB::transaction(function () use ($registration, $user, $reason) {
            /** @var MembershipRegistration $lockedReg */
            $lockedReg = MembershipRegistration::withoutGymScope()
                ->where('id', $registration->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedReg->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' => "Cannot cancel registration in '{$lockedReg->status}' status.",
                ]);
            }

            $lockedReg->update([
                'status' => 'cancelled',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
                'notes' => $reason ? ($lockedReg->notes ? "{$lockedReg->notes}\nCancelled: {$reason}" : "Cancelled: {$reason}") : $lockedReg->notes,
            ]);

            $this->auditService->log(
                action: 'registration.cancelled',
                entityType: MembershipRegistration::class,
                entityId: $lockedReg->id,
                metadata: [
                    'registration_number' => $lockedReg->registration_number,
                    'reason' => $reason,
                    'cancelled_by' => $user->id,
                ],
                gymId: $lockedReg->gym_id
            );

            return $lockedReg->fresh(['membershipPlan', 'gym', 'reviewer']);
        });
    }

    /**
     * Register a member onsite (Front Desk / Admin flow).
     * Immediately and transactionally creates Member, Membership, and Approved Registration.
     */
    public function registerOnsite(
        array $data,
        User $creator,
        ?\Illuminate\Http\UploadedFile $photo = null,
        ?int $gymId = null
    ): MembershipRegistration {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId() ?? $creator->gym_id;

        if (! $resolvedGymId) {
            throw new \InvalidArgumentException('A valid tenant gym context is required to register onsite.');
        }

        // Cross-tenant verification
        if (! $creator->isSuperAdmin() && (int) $creator->gym_id !== (int) $resolvedGymId) {
            throw new \InvalidArgumentException('Creator must belong to the active gym context.');
        }

        // Validate plan exists, belongs to active gym, and is active
        $plan = MembershipPlan::withoutGymScope()
            ->where('gym_id', $resolvedGymId)
            ->where('id', $data['membership_plan_id'])
            ->where('status', 'active')
            ->first();

        if (! $plan) {
            throw ValidationException::withMessages([
                'membership_plan_id' => 'The selected membership plan is invalid or not active for this gym.',
            ]);
        }

        $email = ! empty($data['email']) ? strtolower(trim($data['email'])) : null;
        $phone = ! empty($data['phone']) ? trim($data['phone']) : null;

        // Duplicate member protection (Tenant scoped)
        if ($email || $phone) {
            $existingMember = Member::withoutGymScope()
                ->where('gym_id', $resolvedGymId)
                ->where(function ($q) use ($email, $phone) {
                    if ($email) {
                        $q->where('email', $email);
                    }
                    if ($phone) {
                        $email ? $q->orWhere('phone', $phone) : $q->where('phone', $phone);
                    }
                })
                ->first();

            if ($existingMember) {
                throw ValidationException::withMessages([
                    'email' => 'Member dengan email atau nomor telepon tersebut sudah terdaftar.',
                ]);
            }
        }

        return DB::transaction(function () use ($resolvedGymId, $plan, $data, $email, $phone, $creator, $photo) {
            // 1. Generate Registration Number
            $regNumber = $this->registrationNumberGenerator->generate($resolvedGymId);

            // 2. Map and Create Member using existing MemberService
            $fullName = trim($data['full_name']);
            $nameParts = explode(' ', $fullName, 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? null;

            $emergencyContact = null;
            if (! empty($data['emergency_contact_name']) || ! empty($data['emergency_contact_phone'])) {
                $emergencyContact = [
                    'name' => $data['emergency_contact_name'] ?? null,
                    'phone' => $data['emergency_contact_phone'] ?? null,
                    'relationship' => $data['emergency_contact_relationship'] ?? null,
                ];
            }

            $member = $this->memberService->createMember(
                data: [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'phone' => $phone,
                    'date_of_birth' => $data['date_of_birth'] ?? null,
                    'gender' => $data['gender'] ?? null,
                    'address' => $data['address'] ?? null,
                    'emergency_contact' => $emergencyContact,
                    'status' => 'active',
                ],
                photo: $photo,
                gymId: $resolvedGymId
            );

            // 3. Create Membership using existing MembershipService
            $startDate = ! empty($data['start_date'])
                ? Carbon::parse($data['start_date'])
                : now();

            $membership = $this->membershipService->createMembership(
                data: [
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $startDate->format('Y-m-d'),
                    'status' => 'active',
                    'payment_status' => 'paid',
                    'notes' => $data['notes'] ?? "Onsite registration #{$regNumber}",
                ],
                gymId: $resolvedGymId
            );

            // 4. Create approved MembershipRegistration record (source = 'admin')
            $registration = MembershipRegistration::create([
                'gym_id' => $resolvedGymId,
                'membership_plan_id' => $plan->id,
                'registration_number' => $regNumber,
                'source' => 'admin',
                'status' => 'approved',
                'full_name' => $fullName,
                'email' => $email,
                'phone' => $phone,
                'gender' => $data['gender'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'emergency_contact_relationship' => $data['emergency_contact_relationship'] ?? null,
                'notes' => $data['notes'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'reviewed_by' => $creator->id,
                'reviewed_at' => now(),
                'member_id' => $member->id,
                'membership_id' => $membership->id,
            ]);

            // 5. Audit logs
            $this->auditService->log(
                action: 'registration.created',
                entityType: MembershipRegistration::class,
                entityId: $registration->id,
                metadata: [
                    'registration_number' => $regNumber,
                    'full_name' => $fullName,
                    'email' => $email,
                    'phone' => $phone,
                    'plan_id' => $plan->id,
                    'source' => 'admin',
                ],
                gymId: $resolvedGymId
            );

            $this->auditService->log(
                action: 'registration.approved',
                entityType: MembershipRegistration::class,
                entityId: $registration->id,
                metadata: [
                    'registration_number' => $regNumber,
                    'member_id' => $member->id,
                    'member_number' => $member->member_number,
                    'membership_id' => $membership->id,
                    'plan_id' => $plan->id,
                    'reviewed_by' => $creator->id,
                ],
                gymId: $resolvedGymId
            );

            return $registration->fresh(['membershipPlan', 'gym', 'member', 'membership', 'reviewer']);
        });
    }

    /**
     * Retry automatic member activation for an already-paid registration (Admin recovery).
     */
    public function retryActivation(MembershipRegistration $registration, User $admin): MembershipRegistration
    {
        if (! $admin->isSuperAdmin() && (int) $admin->gym_id !== (int) $registration->gym_id) {
            throw new \InvalidArgumentException('Admin must belong to the same gym as the registration.');
        }

        $activated = $this->activationService->activateRegistration($registration);

        $this->auditService->log(
            action: 'registration.activation_retried',
            entityType: MembershipRegistration::class,
            entityId: $activated->id,
            metadata: [
                'registration_number' => $activated->registration_number,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name,
                'member_id' => $activated->member_id,
            ],
            gymId: $activated->gym_id
        );

        return $activated;
    }
}
