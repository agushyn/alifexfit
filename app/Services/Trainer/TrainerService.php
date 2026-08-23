<?php

namespace App\Services\Trainer;

use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TrainerService
{
    public function __construct(
        protected AuditService $auditService,
        protected GymContext $gymContext
    ) {}

    /**
     * Create a new trainer record.
     *
     * @throws ValidationException
     */
    public function createTrainer(array $data, ?UploadedFile $photo = null, ?int $gymId = null): Trainer
    {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId() ?? auth()->user()?->gym_id;

        if (! $effectiveGymId) {
            throw ValidationException::withMessages([
                'gym_id' => 'Gym context tidak teridentifikasi.',
            ]);
        }

        return DB::transaction(function () use ($data, $photo, $effectiveGymId) {
            $photoPath = null;
            if ($photo) {
                $photoPath = $photo->store("gyms/{$effectiveGymId}/trainers", 'public');
            }

            $status = $data['status'] ?? (isset($data['is_active']) ? (filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive') : 'active');

            $trainer = Trainer::withoutGymScope()->create([
                'gym_id' => $effectiveGymId,
                'name' => trim($data['name']),
                'role' => isset($data['role']) && $data['role'] ? trim($data['role']) : null,
                'email' => isset($data['email']) && $data['email'] ? trim($data['email']) : null,
                'phone' => isset($data['phone']) && $data['phone'] ? trim($data['phone']) : null,
                'bio' => $data['bio'] ?? null,
                'profile_photo' => $photoPath,
                'status' => $status,
                'specialization' => $data['specialization'] ?? null,
                'certification' => isset($data['certification']) && $data['certification'] ? trim($data['certification']) : null,
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'hire_date' => $data['hire_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->auditService->log(
                action: 'trainer.created',
                entityType: 'trainer',
                entityId: $trainer->id,
                metadata: [
                    'gym_id' => $effectiveGymId,
                    'name' => $trainer->name,
                    'role' => $trainer->role,
                    'specialization' => $trainer->specialization,
                    'status' => $trainer->status,
                ]
            );

            return $trainer->load(['gym', 'schedules']);
        });
    }

    /**
     * Update an existing trainer record.
     */
    public function updateTrainer(Trainer $trainer, array $data, ?UploadedFile $photo = null): Trainer
    {
        return DB::transaction(function () use ($trainer, $data, $photo) {
            $effectiveGymId = $trainer->gym_id;

            if ($photo) {
                if ($trainer->profile_photo && Storage::disk('public')->exists($trainer->profile_photo)) {
                    Storage::disk('public')->delete($trainer->profile_photo);
                }
                $trainer->profile_photo = $photo->store("gyms/{$effectiveGymId}/trainers", 'public');
            }

            $status = $trainer->status;
            if (isset($data['status'])) {
                $status = $data['status'];
            } elseif (isset($data['is_active'])) {
                $status = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive';
            }

            $trainer->fill([
                'name' => isset($data['name']) ? trim($data['name']) : $trainer->name,
                'role' => array_key_exists('role', $data) ? ($data['role'] ? trim($data['role']) : null) : $trainer->role,
                'email' => array_key_exists('email', $data) ? ($data['email'] ? trim($data['email']) : null) : $trainer->email,
                'phone' => array_key_exists('phone', $data) ? ($data['phone'] ? trim($data['phone']) : null) : $trainer->phone,
                'bio' => array_key_exists('bio', $data) ? $data['bio'] : $trainer->bio,
                'status' => $status,
                'specialization' => array_key_exists('specialization', $data) ? $data['specialization'] : $trainer->specialization,
                'certification' => array_key_exists('certification', $data) ? ($data['certification'] ? trim($data['certification']) : null) : $trainer->certification,
                'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $trainer->sort_order,
                'hire_date' => array_key_exists('hire_date', $data) ? $data['hire_date'] : $trainer->hire_date,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $trainer->notes,
            ]);

            $trainer->save();

            $this->auditService->log(
                action: 'trainer.updated',
                entityType: 'trainer',
                entityId: $trainer->id,
                metadata: [
                    'gym_id' => $trainer->gym_id,
                    'name' => $trainer->name,
                    'role' => $trainer->role,
                    'status' => $trainer->status,
                ]
            );

            return $trainer->load(['gym', 'schedules']);
        });
    }

    /**
     * Toggle trainer status between active and inactive.
     */
    public function toggleStatus(Trainer $trainer): Trainer
    {
        $newStatus = $trainer->status === 'active' ? 'inactive' : 'active';
        $trainer->status = $newStatus;
        $trainer->save();

        $this->auditService->log(
            action: $newStatus === 'active' ? 'trainer.activated' : 'trainer.deactivated',
            entityType: 'trainer',
            entityId: $trainer->id,
            metadata: [
                'gym_id' => $trainer->gym_id,
                'name' => $trainer->name,
                'status' => $newStatus,
            ]
        );

        return $trainer;
    }

    /**
     * Reorder trainers.
     */
    public function reorder(array $orderedIds, ?int $gymId = null): void
    {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId();

        DB::transaction(function () use ($orderedIds, $effectiveGymId) {
            foreach ($orderedIds as $order => $id) {
                Trainer::where('gym_id', $effectiveGymId)
                    ->where('id', $id)
                    ->update(['sort_order' => $order]);
            }

            $this->auditService->log(
                action: 'trainer.reordered',
                entityType: 'trainer',
                metadata: [
                    'gym_id' => $effectiveGymId,
                    'ordered_ids' => $orderedIds,
                ],
                gymId: $effectiveGymId
            );
        });
    }

    /**
     * Soft delete a trainer.
     */
    public function deleteTrainer(Trainer $trainer): bool
    {
        return DB::transaction(function () use ($trainer) {
            $trainerId = $trainer->id;
            $gymId = $trainer->gym_id;
            $name = $trainer->name;

            // Delete associated schedules
            TrainerSchedule::withoutGymScope()->where('trainer_id', $trainerId)->delete();

            $deleted = $trainer->delete();

            $this->auditService->log(
                action: 'trainer.deleted',
                entityType: 'trainer',
                entityId: $trainerId,
                metadata: [
                    'gym_id' => $gymId,
                    'name' => $name,
                ]
            );

            return (bool) $deleted;
        });
    }

    /**
     * Create a schedule entry for a trainer.
     *
     * @throws ValidationException
     */
    public function createSchedule(Trainer $trainer, array $data): TrainerSchedule
    {
        $startTime = $data['start_time'];
        $endTime = $data['end_time'];

        if ($startTime >= $endTime) {
            throw ValidationException::withMessages([
                'end_time' => 'Jam selesai (end_time) harus setelah jam mulai (start_time).',
            ]);
        }

        $schedule = TrainerSchedule::withoutGymScope()->create([
            'gym_id' => $trainer->gym_id,
            'trainer_id' => $trainer->id,
            'day_of_week' => (int) $data['day_of_week'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $data['status'] ?? 'active',
            'notes' => $data['notes'] ?? null,
        ]);

        $this->auditService->log(
            action: 'trainer_schedule.created',
            entityType: 'trainer_schedule',
            entityId: $schedule->id,
            metadata: [
                'gym_id' => $trainer->gym_id,
                'trainer_id' => $trainer->id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
            ]
        );

        return $schedule;
    }

    /**
     * Update an existing schedule entry.
     *
     * @throws ValidationException
     */
    public function updateSchedule(TrainerSchedule $schedule, array $data): TrainerSchedule
    {
        $startTime = $data['start_time'] ?? $schedule->start_time;
        $endTime = $data['end_time'] ?? $schedule->end_time;

        if ($startTime >= $endTime) {
            throw ValidationException::withMessages([
                'end_time' => 'Jam selesai (end_time) harus setelah jam mulai (start_time).',
            ]);
        }

        $schedule->fill([
            'day_of_week' => isset($data['day_of_week']) ? (int) $data['day_of_week'] : $schedule->day_of_week,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $data['status'] ?? $schedule->status,
            'notes' => array_key_exists('notes', $data) ? $data['notes'] : $schedule->notes,
        ]);

        $schedule->save();

        $this->auditService->log(
            action: 'trainer_schedule.updated',
            entityType: 'trainer_schedule',
            entityId: $schedule->id,
            metadata: [
                'gym_id' => $schedule->gym_id,
                'trainer_id' => $schedule->trainer_id,
                'day_of_week' => $schedule->day_of_week,
            ]
        );

        return $schedule;
    }

    /**
     * Delete a schedule entry.
     */
    public function deleteSchedule(TrainerSchedule $schedule): bool
    {
        $scheduleId = $schedule->id;
        $gymId = $schedule->gym_id;
        $trainerId = $schedule->trainer_id;

        $deleted = $schedule->delete();

        $this->auditService->log(
            action: 'trainer_schedule.deleted',
            entityType: 'trainer_schedule',
            entityId: $scheduleId,
            metadata: [
                'gym_id' => $gymId,
                'trainer_id' => $trainerId,
            ]
        );

        return (bool) $deleted;
    }
}
