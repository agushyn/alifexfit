<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Models\User;
use App\Services\Audit\AuditService;
use App\Services\Memberships\MembershipRegistrationService;
use App\Services\Tenancy\GymContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeadService
{
    public function __construct(
        protected LeadNumberGenerator $numberGenerator,
        protected MembershipRegistrationService $registrationService,
        protected AuditService $auditService,
        protected GymContext $gymContext
    ) {}

    /**
     * Allowed status transitions state machine.
     */
    protected const ALLOWED_TRANSITIONS = [
        Lead::STATUS_NEW => [
            Lead::STATUS_CONTACTED,
            Lead::STATUS_QUALIFIED,
            Lead::STATUS_LOST,
        ],
        Lead::STATUS_CONTACTED => [
            Lead::STATUS_QUALIFIED,
            Lead::STATUS_NOT_INTERESTED,
            Lead::STATUS_LOST,
        ],
        Lead::STATUS_QUALIFIED => [
            Lead::STATUS_INTERESTED,
            Lead::STATUS_NOT_INTERESTED,
            Lead::STATUS_LOST,
        ],
        Lead::STATUS_INTERESTED => [
            Lead::STATUS_CONVERTED,
            Lead::STATUS_LOST,
        ],
        Lead::STATUS_CONVERTED => [],
        Lead::STATUS_NOT_INTERESTED => [],
        Lead::STATUS_LOST => [],
    ];

    /**
     * Capture a public lead from website.
     */
    public function createPublicLead(array $data, ?int $gymId = null): Lead
    {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

        if (! $resolvedGymId) {
            throw new \InvalidArgumentException('Tenant gym context is required for public lead submission.');
        }

        $phone = trim($data['phone']);
        $email = !empty($data['email']) ? strtolower(trim($data['email'])) : null;

        // Duplicate active lead protection within same gym
        $hasActiveLead = Lead::withoutGymScope()
            ->where('gym_id', $resolvedGymId)
            ->whereNotIn('status', [Lead::STATUS_CONVERTED, Lead::STATUS_LOST, Lead::STATUS_NOT_INTERESTED])
            ->where(function ($q) use ($phone, $email) {
                $q->where('phone', $phone);
                if ($email) {
                    $q->orWhere('email', $email);
                }
            })
            ->exists();

        if ($hasActiveLead) {
            throw ValidationException::withMessages([
                'phone' => 'Terima kasih, data ketertarikan Anda sudah tercatat dan tim kami akan segera menghubungi Anda.',
            ]);
        }

        // Validate plan if given
        $planId = $data['membership_plan_id'] ?? null;
        if ($planId) {
            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $resolvedGymId)
                ->where('id', $planId)
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'Paket membership yang dipilih tidak valid atau tidak aktif.',
                ]);
            }
        }

        $leadNumber = $this->numberGenerator->generate($resolvedGymId);

        $lead = Lead::create([
            'gym_id' => $resolvedGymId,
            'lead_number' => $leadNumber,
            'name' => trim($data['name']),
            'email' => $email,
            'phone' => $phone,
            'whatsapp' => !empty($data['whatsapp']) ? trim($data['whatsapp']) : null,
            'membership_plan_id' => $planId,
            'interest_type' => $data['interest_type'] ?? Lead::INTEREST_GENERAL_INQUIRY,
            'message' => $data['message'] ?? null,
            'source' => Lead::SOURCE_WEBSITE,
            'source_detail' => $data['source_detail'] ?? null,
            'status' => Lead::STATUS_NEW,
        ]);

        $this->auditService->log(
            action: 'lead.created',
            entityType: Lead::class,
            entityId: $lead->id,
            metadata: [
                'lead_number' => $leadNumber,
                'source' => Lead::SOURCE_WEBSITE,
                'name' => $lead->name,
                'phone' => $lead->phone,
            ],
            gymId: $resolvedGymId
        );

        return $lead;
    }

    /**
     * Create a manual lead from admin desk.
     */
    public function createAdminLead(array $data, User $actor, ?int $gymId = null): Lead
    {
        $resolvedGymId = $actor->isSuperAdmin()
            ? ($gymId ?? $this->gymContext->getGymId() ?? $actor->gym_id)
            : $actor->gym_id;

        if (! $resolvedGymId) {
            throw new \InvalidArgumentException('Tenant gym context is required.');
        }

        $planId = $data['membership_plan_id'] ?? null;
        if ($planId) {
            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $resolvedGymId)
                ->where('id', $planId)
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'Paket membership yang dipilih tidak valid untuk cabang ini.',
                ]);
            }
        }

        $assignedTo = $data['assigned_to'] ?? null;
        if ($assignedTo) {
            $user = User::where('id', $assignedTo)->first();
            if (! $user || ($user->gym_id !== $resolvedGymId && ! $user->isSuperAdmin())) {
                throw ValidationException::withMessages([
                    'assigned_to' => 'Staff yang ditugaskan harus terdaftar pada cabang ini.',
                ]);
            }
        }

        $leadNumber = $this->numberGenerator->generate($resolvedGymId);

        $lead = Lead::create([
            'gym_id' => $resolvedGymId,
            'lead_number' => $leadNumber,
            'name' => trim($data['name']),
            'email' => !empty($data['email']) ? strtolower(trim($data['email'])) : null,
            'phone' => trim($data['phone']),
            'whatsapp' => !empty($data['whatsapp']) ? trim($data['whatsapp']) : null,
            'membership_plan_id' => $planId,
            'interest_type' => $data['interest_type'] ?? Lead::INTEREST_GENERAL_INQUIRY,
            'message' => $data['message'] ?? null,
            'source' => $data['source'] ?? Lead::SOURCE_WALK_IN,
            'source_detail' => $data['source_detail'] ?? null,
            'status' => Lead::STATUS_NEW,
            'assigned_to' => $assignedTo,
            'notes' => $data['notes'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        $this->auditService->log(
            action: 'lead.created',
            entityType: Lead::class,
            entityId: $lead->id,
            metadata: [
                'lead_number' => $leadNumber,
                'source' => $lead->source,
                'created_by' => $actor->id,
            ],
            gymId: $resolvedGymId
        );

        if ($assignedTo) {
            $this->auditService->log(
                action: 'lead.assigned',
                entityType: Lead::class,
                entityId: $lead->id,
                metadata: [
                    'assigned_to' => $assignedTo,
                    'assigned_by' => $actor->id,
                ],
                gymId: $resolvedGymId
            );
        }

        return $lead;
    }

    /**
     * Update lead details.
     */
    public function updateLead(Lead $lead, array $data, User $actor): Lead
    {
        $planId = $data['membership_plan_id'] ?? null;
        if ($planId) {
            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $lead->gym_id)
                ->where('id', $planId)
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'Paket membership tidak valid untuk cabang ini.',
                ]);
            }
        }

        $lead->update([
            'name' => trim($data['name']),
            'email' => !empty($data['email']) ? strtolower(trim($data['email'])) : null,
            'phone' => trim($data['phone']),
            'whatsapp' => !empty($data['whatsapp']) ? trim($data['whatsapp']) : null,
            'membership_plan_id' => $planId,
            'interest_type' => $data['interest_type'] ?? $lead->interest_type,
            'message' => $data['message'] ?? $lead->message,
            'source' => $data['source'] ?? $lead->source,
            'source_detail' => $data['source_detail'] ?? $lead->source_detail,
            'notes' => $data['notes'] ?? $lead->notes,
        ]);

        $this->auditService->log(
            action: 'lead.updated',
            entityType: Lead::class,
            entityId: $lead->id,
            metadata: [
                'updated_by' => $actor->id,
            ],
            gymId: $lead->gym_id
        );

        return $lead;
    }

    /**
     * Change lead pipeline status with state machine validation.
     */
    public function changeStatus(Lead $lead, string $newStatus, User $actor, ?string $reason = null): Lead
    {
        $allowed = self::ALLOWED_TRANSITIONS[$lead->status] ?? [];

        if (! in_array($newStatus, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => "Perubahan status dari '{$lead->status}' ke '{$newStatus}' tidak diperbolehkan.",
            ]);
        }

        $oldStatus = $lead->status;
        $lead->status = $newStatus;

        if ($reason) {
            $existingNotes = $lead->notes ? $lead->notes . "\n" : '';
            $lead->notes = $existingNotes . "[Status ke {$newStatus}]: " . $reason;
        }

        $lead->save();

        $this->auditService->log(
            action: 'lead.status_changed',
            entityType: Lead::class,
            entityId: $lead->id,
            metadata: [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $actor->id,
                'reason' => $reason,
            ],
            gymId: $lead->gym_id
        );

        return $lead;
    }

    /**
     * Assign lead to a staff member in the same tenant.
     */
    public function assignLead(Lead $lead, ?User $assignee, User $actor): Lead
    {
        if ($assignee) {
            if ($assignee->gym_id !== $lead->gym_id && ! $assignee->isSuperAdmin()) {
                throw ValidationException::withMessages([
                    'assigned_to' => 'Staff yang dipilih tidak terdaftar pada cabang gym prospek ini.',
                ]);
            }
        }

        $previousAssigneeId = $lead->assigned_to;
        $lead->assigned_to = $assignee?->id;
        $lead->save();

        $this->auditService->log(
            action: 'lead.assigned',
            entityType: Lead::class,
            entityId: $lead->id,
            metadata: [
                'previous_assigned_to' => $previousAssigneeId,
                'new_assigned_to' => $assignee?->id,
                'assigned_by' => $actor->id,
            ],
            gymId: $lead->gym_id
        );

        return $lead;
    }

    /**
     * Record follow-up contact activity.
     */
    public function recordContact(Lead $lead, array $data, User $actor): LeadActivity
    {
        return DB::transaction(function () use ($lead, $data, $actor) {
            $contactedAt = $data['contacted_at'] ?? now();
            $nextFollowUpAt = $data['next_follow_up_at'] ?? null;

            $activity = LeadActivity::create([
                'gym_id' => $lead->gym_id,
                'lead_id' => $lead->id,
                'user_id' => $actor->id,
                'type' => $data['type'],
                'note' => $data['note'],
                'contacted_at' => $contactedAt,
                'next_follow_up_at' => $nextFollowUpAt,
                'metadata' => $data['metadata'] ?? null,
            ]);

            $lead->last_contacted_at = $contactedAt;
            if ($nextFollowUpAt) {
                $lead->next_follow_up_at = $nextFollowUpAt;
            }

            // Auto-advance 'new' status to 'contacted'
            if ($lead->status === Lead::STATUS_NEW) {
                $lead->status = Lead::STATUS_CONTACTED;
            }

            $lead->save();

            $this->auditService->log(
                action: 'lead.contact_recorded',
                entityType: Lead::class,
                entityId: $lead->id,
                metadata: [
                    'activity_id' => $activity->id,
                    'type' => $activity->type,
                    'actor_id' => $actor->id,
                    'contacted_at' => $contactedAt,
                    'next_follow_up_at' => $nextFollowUpAt,
                ],
                gymId: $lead->gym_id
            );

            return $activity;
        });
    }

    /**
     * Convert Lead to a Pending Membership Registration (Atomic Transaction).
     * NOTE: Does NOT create Member or Membership directly.
     */
    public function convertLead(Lead $lead, User $actor, array $overrideData = []): MembershipRegistration
    {
        return DB::transaction(function () use ($lead, $actor, $overrideData) {
            // Pessimistic row-level lock
            $lockedLead = Lead::withoutGymScope()
                ->where('id', $lead->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedLead->gym_id !== $actor->gym_id && ! $actor->isSuperAdmin()) {
                throw ValidationException::withMessages([
                    'lead' => 'Anda tidak memiliki hak akses untuk mengonversi prospek cabang lain.',
                ]);
            }

            if ($lockedLead->status === Lead::STATUS_CONVERTED || $lockedLead->membership_registration_id) {
                throw ValidationException::withMessages([
                    'lead' => 'Prospek ini sudah dikonversi menjadi permohonan pendaftaran sebelumnya.',
                ]);
            }

            $planId = $overrideData['membership_plan_id'] ?? $lockedLead->membership_plan_id;
            if (! $planId) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'Silakan pilih paket membership untuk mengonversi prospek ini.',
                ]);
            }

            $plan = MembershipPlan::withoutGymScope()
                ->where('gym_id', $lockedLead->gym_id)
                ->where('id', $planId)
                ->where('status', 'active')
                ->first();

            if (! $plan) {
                throw ValidationException::withMessages([
                    'membership_plan_id' => 'Paket membership yang dipilih tidak valid atau tidak aktif untuk cabang ini.',
                ]);
            }

            $registrationData = [
                'membership_plan_id' => $plan->id,
                'full_name' => $overrideData['full_name'] ?? $lockedLead->name,
                'email' => $overrideData['email'] ?? $lockedLead->email ?? "lead.{$lockedLead->lead_number}@exfits.local",
                'phone' => $overrideData['phone'] ?? $lockedLead->phone,
                'gender' => $overrideData['gender'] ?? null,
                'date_of_birth' => $overrideData['date_of_birth'] ?? null,
                'address' => $overrideData['address'] ?? ($lockedLead->metadata['address'] ?? 'Didaftarkan melalui konversi prospek'),
                'city' => $overrideData['city'] ?? ($lockedLead->metadata['city'] ?? null),
                'emergency_contact_name' => $overrideData['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $overrideData['emergency_contact_phone'] ?? null,
                'emergency_contact_relationship' => $overrideData['emergency_contact_relationship'] ?? null,
                'notes' => "Dikonversi dari prospek #{$lockedLead->lead_number} oleh {$actor->name}." . ($lockedLead->message ? " Pesan awal: {$lockedLead->message}" : ''),
                'metadata' => [
                    'converted_from_lead_id' => $lockedLead->id,
                    'converted_from_lead_number' => $lockedLead->lead_number,
                    'converted_by_user_id' => $actor->id,
                ],
            ];

            // Delegate to existing registration service: creates a 'pending' registration with source 'admin'
            $registration = $this->registrationService->createRegistration(
                data: $registrationData,
                gymId: $lockedLead->gym_id,
                source: 'admin'
            );

            // Update lead state
            $lockedLead->status = Lead::STATUS_CONVERTED;
            $lockedLead->converted_at = now();
            $lockedLead->membership_registration_id = $registration->id;
            $lockedLead->save();

            $this->auditService->log(
                action: 'lead.converted',
                entityType: Lead::class,
                entityId: $lockedLead->id,
                metadata: [
                    'lead_number' => $lockedLead->lead_number,
                    'membership_registration_id' => $registration->id,
                    'registration_number' => $registration->registration_number,
                    'converted_by' => $actor->id,
                ],
                gymId: $lockedLead->gym_id
            );

            return $registration;
        });
    }
}
