<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGymRequest;
use App\Http\Requests\Admin\UpdateGymRequest;
use App\Models\Gym;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GymController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Gym::class);

        $search = $request->query('search');
        $status = $request->query('status');

        $gyms = Gym::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->withCount('users')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Gyms/Index', [
            'gyms' => $gyms,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Gym::class);

        return Inertia::render('Admin/Gyms/Create');
    }

    public function store(StoreGymRequest $request, AuditService $auditService): RedirectResponse
    {
        $gym = Gym::create($request->validated());

        $auditService->log(
            action: 'gym.created',
            entityType: Gym::class,
            entityId: $gym->id,
            metadata: $gym->toArray(),
            gymId: $gym->id
        );

        return redirect()->route('admin.gyms.index')->with('success', "Gym '{$gym->name}' was created successfully.");
    }

    public function edit(Gym $gym): Response
    {
        Gate::authorize('update', $gym);

        return Inertia::render('Admin/Gyms/Edit', [
            'gym' => $gym,
        ]);
    }

    public function update(UpdateGymRequest $request, Gym $gym, AuditService $auditService): RedirectResponse
    {
        $gym->update($request->validated());

        $auditService->log(
            action: 'gym.updated',
            entityType: Gym::class,
            entityId: $gym->id,
            metadata: $gym->toArray(),
            gymId: $gym->id
        );

        return redirect()->route('admin.gyms.index')->with('success', "Gym '{$gym->name}' was updated successfully.");
    }

    public function destroy(Gym $gym, AuditService $auditService): RedirectResponse
    {
        Gate::authorize('delete', $gym);

        $gymName = $gym->name;
        $gymId = $gym->id;

        $gym->delete();

        $auditService->log(
            action: 'gym.deleted',
            entityType: Gym::class,
            entityId: $gymId,
            metadata: ['name' => $gymName],
            gymId: null
        );

        return redirect()->route('admin.gyms.index')->with('success', "Gym '{$gymName}' was deleted successfully.");
    }

    public function switchContext(Request $request, Gym $gym, GymContext $gymContext, AuditService $auditService): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            abort(403, 'Only Super Administrators can switch gym contexts.');
        }

        session(['active_gym_id' => $gym->id]);
        $gymContext->setGym($gym);

        $auditService->log(
            action: 'gym.switch_context',
            entityType: Gym::class,
            entityId: $gym->id,
            metadata: ['target_gym_id' => $gym->id, 'target_gym_name' => $gym->name],
            gymId: $gym->id
        );

        return redirect()->back()->with('success', "Switched active context to '{$gym->name}'.");
    }
}
