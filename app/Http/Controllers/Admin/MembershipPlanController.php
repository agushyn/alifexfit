<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMembershipPlanRequest;
use App\Http\Requests\Admin\UpdateMembershipPlanRequest;
use App\Models\MembershipPlan;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MembershipPlanController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', MembershipPlan::class);

        $search = $request->query('search');
        $status = $request->query('status');

        $plans = MembershipPlan::query()
            ->with('gym:id,name,code')
            ->withCount('memberships')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('sort_order', 'asc')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/MembershipPlans/Index', [
            'plans' => $plans,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', MembershipPlan::class);

        return Inertia::render('Admin/MembershipPlans/Create');
    }

    public function store(
        StoreMembershipPlanRequest $request,
        AuditService $auditService,
        GymContext $gymContext
    ): RedirectResponse {
        $gymId = $request->user()->isSuperAdmin()
            ? ($gymContext->getGymId() ?? $request->user()->gym_id)
            : $request->user()->gym_id;

        $plan = MembershipPlan::create([
            'gym_id' => $gymId,
            ...$request->validated(),
        ]);

        $auditService->log(
            action: 'membership_plan.created',
            entityType: MembershipPlan::class,
            entityId: $plan->id,
            metadata: [
                'name' => $plan->name,
                'price' => $plan->price,
                'billing_period' => $plan->billing_period,
                'duration' => $plan->duration,
            ],
            gymId: $plan->gym_id
        );

        return redirect()->route('admin.membership-plans.index')
            ->with('success', "Membership plan '{$plan->name}' created successfully.");
    }

    public function edit(MembershipPlan $membershipPlan): Response
    {
        Gate::authorize('update', $membershipPlan);

        return Inertia::render('Admin/MembershipPlans/Edit', [
            'plan' => $membershipPlan,
        ]);
    }

    public function update(
        UpdateMembershipPlanRequest $request,
        MembershipPlan $membershipPlan,
        AuditService $auditService
    ): RedirectResponse {
        $membershipPlan->update($request->validated());

        $auditService->log(
            action: 'membership_plan.updated',
            entityType: MembershipPlan::class,
            entityId: $membershipPlan->id,
            metadata: [
                'name' => $membershipPlan->name,
                'price' => $membershipPlan->price,
                'status' => $membershipPlan->status,
            ],
            gymId: $membershipPlan->gym_id
        );

        return redirect()->route('admin.membership-plans.index')
            ->with('success', "Membership plan '{$membershipPlan->name}' updated successfully.");
    }

    public function destroy(
        MembershipPlan $membershipPlan,
        AuditService $auditService
    ): RedirectResponse {
        Gate::authorize('delete', $membershipPlan);

        $planName = $membershipPlan->name;
        $gymId = $membershipPlan->gym_id;

        // If plan has historical memberships, soft-delete it safely
        $membershipPlan->delete();

        $auditService->log(
            action: 'membership_plan.deleted',
            entityType: MembershipPlan::class,
            entityId: $membershipPlan->id,
            metadata: [
                'name' => $planName,
            ],
            gymId: $gymId
        );

        return redirect()->route('admin.membership-plans.index')
            ->with('success', "Membership plan '{$planName}' deleted successfully.");
    }
}