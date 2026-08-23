<?php

namespace App\Services\Trainer;

use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Services\Tenancy\GymContext;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class TrainerAvailabilityService
{
    public function __construct(
        protected GymContext $gymContext
    ) {}

    /**
     * Check if a specific trainer is currently available (or available at a specific date/time).
     */
    public function isTrainerAvailable(Trainer|int $trainer, ?Carbon $dateTime = null, ?int $gymId = null): bool
    {
        $trainerModel = is_int($trainer)
            ? Trainer::withoutGymScope()->find($trainer)
            : $trainer;

        if (! $trainerModel || $trainerModel->status !== 'active') {
            return false;
        }

        if ($gymId !== null && (int) $trainerModel->gym_id !== (int) $gymId) {
            return false;
        }

        $checkTime = $dateTime ?? Carbon::now();
        $dayOfWeek = $checkTime->dayOfWeek;
        $timeStr = $checkTime->format('H:i:s');

        return TrainerSchedule::withoutGymScope()
            ->where('trainer_id', $trainerModel->id)
            ->where('status', 'active')
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $timeStr)
            ->where('end_time', '>=', $timeStr)
            ->exists();
    }

    /**
     * Get all active trainers for a gym who are available at the given date/time.
     *
     * @return Collection<int, Trainer>
     */
    public function getAvailableTrainers(?Carbon $dateTime = null, ?int $workoutTypeId = null, ?int $gymId = null): Collection
    {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId() ?? auth()->user()?->gym_id;

        if (! $effectiveGymId) {
            return new Collection;
        }

        $checkTime = $dateTime ?? Carbon::now();
        $dayOfWeek = $checkTime->dayOfWeek;
        $timeStr = $checkTime->format('H:i:s');

        return Trainer::withoutGymScope()
            ->where('gym_id', $effectiveGymId)
            ->where('status', 'active')
            ->whereHas('schedules', function ($query) use ($dayOfWeek, $timeStr) {
                $query->where('status', 'active')
                    ->where('day_of_week', $dayOfWeek)
                    ->where('start_time', '<=', $timeStr)
                    ->where('end_time', '>=', $timeStr);
            })
            ->with(['activeSchedules' => function ($query) use ($dayOfWeek) {
                $query->where('day_of_week', $dayOfWeek);
            }])
            ->orderBy('name')
            ->get();
    }

    /**
     * Validate trainer eligibility for a workout session.
     *
     * @throws ValidationException
     */
    public function validateTrainerSelection(
        int $trainerId,
        int $gymId,
        ?Carbon $dateTime = null,
        bool $enforceSchedule = false
    ): Trainer {
        $trainer = Trainer::withoutGymScope()
            ->where('id', $trainerId)
            ->first();

        if (! $trainer) {
            throw ValidationException::withMessages([
                'trainer_id' => 'Trainer tidak ditemukan.',
            ]);
        }

        if ((int) $trainer->gym_id !== (int) $gymId) {
            throw ValidationException::withMessages([
                'trainer_id' => 'Trainer tidak terdaftar pada gym ini.',
            ]);
        }

        if ($trainer->status !== 'active') {
            throw ValidationException::withMessages([
                'trainer_id' => 'Trainer sedang tidak aktif.',
            ]);
        }

        if ($enforceSchedule && ! $this->isTrainerAvailable($trainer, $dateTime, $gymId)) {
            throw ValidationException::withMessages([
                'trainer_id' => 'Trainer tidak memiliki jadwal aktif pada jam ini.',
            ]);
        }

        return $trainer;
    }
}
