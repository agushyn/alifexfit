<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWorkoutTypeRequest;
use App\Http\Requests\Admin\UpdateWorkoutTypeRequest;
use App\Models\WorkoutType;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WorkoutTypeController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', WorkoutType::class);

        $search = $request->query('search');
        $status = $request->query('status');
        $category = $request->query('category');

        $workoutTypes = WorkoutType::query()
            ->with('gym:id,name,code')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->orderBy('sort_order', 'asc')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $categories = WorkoutType::query()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Admin/WorkoutTypes/Index', [
            'workoutTypes' => $workoutTypes,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', WorkoutType::class);

        return Inertia::render('Admin/WorkoutTypes/Create');
    }

    public function store(
        StoreWorkoutTypeRequest $request,
        AuditService $auditService,
        GymContext $gymContext
    ): RedirectResponse {
        $gymId = $request->user()->isSuperAdmin()
            ? ($gymContext->getGymId() ?? $request->user()->gym_id)
            : $request->user()->gym_id;

        $type = WorkoutType::create([
            'gym_id' => $gymId,
            ...$request->validated(),
        ]);

        $auditService->log(
            action: 'workout_type.created',
            entityType: WorkoutType::class,
            entityId: $type->id,
            metadata: [
                'name' => $type->name,
                'category' => $type->category,
            ],
            gymId: $type->gym_id
        );

        return redirect()->route('admin.workout-types.index')
            ->with('success', "Workout type '{$type->name}' created successfully.");
    }

    public function edit(WorkoutType $workoutType): Response
    {
        Gate::authorize('update', $workoutType);

        return Inertia::render('Admin/WorkoutTypes/Edit', [
            'workoutType' => $workoutType,
        ]);
    }

    public function update(
        UpdateWorkoutTypeRequest $request,
        WorkoutType $workoutType,
        AuditService $auditService
    ): RedirectResponse {
        $workoutType->update($request->validated());

        $auditService->log(
            action: 'workout_type.updated',
            entityType: WorkoutType::class,
            entityId: $workoutType->id,
            metadata: [
                'name' => $workoutType->name,
                'status' => $workoutType->status,
            ],
            gymId: $workoutType->gym_id
        );

        return redirect()->route('admin.workout-types.index')
            ->with('success', "Workout type '{$workoutType->name}' updated successfully.");
    }

    public function destroy(
        WorkoutType $workoutType,
        AuditService $auditService
    ): RedirectResponse {
        Gate::authorize('delete', $workoutType);

        $typeName = $workoutType->name;
        $gymId = $workoutType->gym_id;

        $workoutType->delete();

        $auditService->log(
            action: 'workout_type.deleted',
            entityType: WorkoutType::class,
            entityId: $workoutType->id,
            metadata: [
                'name' => $typeName,
            ],
            gymId: $gymId
        );

        return redirect()->route('admin.workout-types.index')
            ->with('success', "Workout type '{$typeName}' deleted successfully.");
    }
}