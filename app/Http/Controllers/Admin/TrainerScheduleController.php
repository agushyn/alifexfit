<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTrainerScheduleRequest;
use App\Http\Requests\Admin\UpdateTrainerScheduleRequest;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Services\Trainer\TrainerAvailabilityService;
use App\Services\Trainer\TrainerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TrainerScheduleController extends Controller
{
    public function __construct(
        protected TrainerService $trainerService,
        protected TrainerAvailabilityService $availabilityService
    ) {}

    public function index(Trainer $trainer): Response
    {
        Gate::authorize('view', $trainer);

        $trainer->load([
            'gym:id,name,code',
            'schedules' => fn ($q) => $q->orderBy('day_of_week')->orderBy('start_time'),
        ]);

        $trainer->is_available_now = $this->availabilityService->isTrainerAvailable($trainer);

        return Inertia::render('Admin/Trainers/Schedule', [
            'trainer' => $trainer,
            'days' => TrainerSchedule::$days,
        ]);
    }

    public function store(StoreTrainerScheduleRequest $request, Trainer $trainer): RedirectResponse
    {
        $this->trainerService->createSchedule($trainer, $request->validated());

        return back()->with('success', 'Jadwal ketersediaan trainer berhasil ditambahkan.');
    }

    public function update(UpdateTrainerScheduleRequest $request, TrainerSchedule $schedule): RedirectResponse
    {
        $this->trainerService->updateSchedule($schedule, $request->validated());

        return back()->with('success', 'Jadwal ketersediaan trainer berhasil diperbarui.');
    }

    public function destroy(TrainerSchedule $schedule): RedirectResponse
    {
        $trainer = $schedule->trainer;
        Gate::authorize('manageSchedule', $trainer);

        $this->trainerService->deleteSchedule($schedule);

        return back()->with('success', 'Jadwal ketersediaan trainer berhasil dihapus.');
    }
}
