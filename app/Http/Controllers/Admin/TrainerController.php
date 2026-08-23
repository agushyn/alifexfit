<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTrainerRequest;
use App\Http\Requests\Admin\UpdateTrainerRequest;
use App\Models\Trainer;
use App\Models\TrainingSession;
use App\Services\Trainer\TrainerAvailabilityService;
use App\Services\Trainer\TrainerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TrainerController extends Controller
{
    public function __construct(
        protected TrainerService $trainerService,
        protected TrainerAvailabilityService $availabilityService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Trainer::class);

        $query = Trainer::with(['schedules', 'gym:id,name,code'])->ordered();

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('specialization')) {
            $query->where('specialization', 'like', '%' . $request->input('specialization') . '%');
        }

        $trainers = $query->withCount('trainingSessions')->paginate(12)->withQueryString();

        // Attach live availability to paginated records
        $trainers->getCollection()->transform(function ($trainer) {
            $trainer->is_available_now = $this->availabilityService->isTrainerAvailable($trainer);
            return $trainer;
        });

        $allTrainers = Trainer::all();
        $availableNowCount = $allTrainers->filter(fn ($t) => $this->availabilityService->isTrainerAvailable($t))->count();

        $stats = [
            'total' => Trainer::count(),
            'active' => Trainer::where('status', 'active')->count(),
            'inactive' => Trainer::where('status', 'inactive')->count(),
            'available_now' => $availableNowCount,
            'total_sessions' => TrainingSession::whereNotNull('trainer_id')->count(),
        ];

        return Inertia::render('Admin/Trainers/Index', [
            'trainers' => $trainers,
            'filters' => $request->only(['search', 'status', 'specialization']),
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Trainer::class);

        $nextSortOrder = (Trainer::max('sort_order') ?? -1) + 1;

        return Inertia::render('Admin/Trainers/Create', [
            'nextSortOrder' => $nextSortOrder,
        ]);
    }

    public function store(StoreTrainerRequest $request): RedirectResponse
    {
        $trainer = $this->trainerService->createTrainer(
            data: $request->validated(),
            photo: $request->file('profile_photo')
        );

        return redirect()->route('admin.trainers.show', $trainer->id)
            ->with('success', "Trainer {$trainer->name} berhasil ditambahkan.");
    }

    public function show(Trainer $trainer): Response
    {
        Gate::authorize('view', $trainer);

        $trainer->load([
            'gym:id,name,code,address',
            'schedules' => fn ($q) => $q->orderBy('day_of_week')->orderBy('start_time'),
            'trainingSessions' => fn ($q) => $q->with(['member:id,gym_id,first_name,last_name,full_name,member_number', 'workoutType:id,name,category'])->latest('started_at')->take(15),
        ]);

        $trainer->loadCount('trainingSessions');
        $trainer->is_available_now = $this->availabilityService->isTrainerAvailable($trainer);

        $stats = [
            'total_sessions' => $trainer->training_sessions_count,
            'completed_sessions' => $trainer->trainingSessions()->where('status', 'completed')->count(),
            'active_schedules_count' => $trainer->schedules()->where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/Trainers/Show', [
            'trainer' => $trainer,
            'stats' => $stats,
        ]);
    }

    public function edit(Trainer $trainer): Response
    {
        Gate::authorize('update', $trainer);

        return Inertia::render('Admin/Trainers/Edit', [
            'trainer' => $trainer,
        ]);
    }

    public function update(UpdateTrainerRequest $request, Trainer $trainer): RedirectResponse
    {
        $this->trainerService->updateTrainer(
            trainer: $trainer,
            data: $request->validated(),
            photo: $request->file('profile_photo')
        );

        return redirect()->route('admin.trainers.show', $trainer->id)
            ->with('success', "Data trainer {$trainer->name} berhasil diperbarui.");
    }

    public function toggleStatus(Trainer $trainer): RedirectResponse
    {
        Gate::authorize('update', $trainer);

        $updated = $this->trainerService->toggleStatus($trainer);
        $statusLabel = $updated->status === 'active' ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Status trainer {$updated->name} berhasil {$statusLabel}.");
    }

    public function reorder(Request $request): RedirectResponse
    {
        Gate::authorize('create', Trainer::class);

        $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer'],
        ]);

        $this->trainerService->reorder($request->input('ordered_ids'));

        return back()->with('success', 'Urutan trainer berhasil diperbarui.');
    }

    public function destroy(Trainer $trainer): RedirectResponse
    {
        Gate::authorize('delete', $trainer);

        $name = $trainer->name;
        $this->trainerService->deleteTrainer($trainer);

        return redirect()->route('admin.trainers.index')
            ->with('success', "Trainer {$name} berhasil dihapus.");
    }
}
