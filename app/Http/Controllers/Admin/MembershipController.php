<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMembershipRequest;
use App\Http\Requests\Admin\UpdateMembershipRequest;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Services\Audit\AuditService;
use App\Services\Memberships\MembershipService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MembershipController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Membership::class);

        $search = $request->query('search');
        $status = $request->query('status');
        $paymentStatus = $request->query('payment_status');
        $planId = $request->query('plan_id');

        $query = Membership::query()
            ->with(['member:id,gym_id,first_name,last_name,full_name,member_number,email,phone,profile_photo', 'membershipPlan:id,name,billing_period,duration', 'gym:id,name,code'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('member', function ($sub) use ($search) {
                    $sub->where('member_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($paymentStatus, fn ($q) => $q->where('payment_status', $paymentStatus))
            ->when($planId, fn ($q) => $q->where('membership_plan_id', $planId))
            ->latest('start_date');

        $memberships = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => Membership::count(),
            'active' => Membership::active()->count(),
            'pending' => Membership::pending()->count(),
            'expired' => Membership::expired()->count(),
        ];

        $plans = MembershipPlan::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Memberships/Index', [
            'memberships' => $memberships,
            'stats' => $stats,
            'plans' => $plans,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'plan_id' => $planId,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Membership::class);

        $preselectedMemberId = $request->query('member_id');

        $members = Member::active()
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'full_name', 'member_number', 'email', 'phone']);

        $plans = MembershipPlan::active()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'price', 'billing_period', 'duration', 'trainer_quota', 'description', 'benefits']);

        return Inertia::render('Admin/Memberships/Create', [
            'members' => $members,
            'plans' => $plans,
            'preselectedMemberId' => $preselectedMemberId ? (int) $preselectedMemberId : null,
        ]);
    }

    public function store(
        StoreMembershipRequest $request,
        MembershipService $membershipService,
        AuditService $auditService
    ): RedirectResponse {
        $membership = $membershipService->createMembership($request->validated());

        $auditService->log(
            action: 'membership.created',
            entityType: Membership::class,
            entityId: $membership->id,
            metadata: [
                'member_id' => $membership->member_id,
                'plan_id' => $membership->membership_plan_id,
                'price' => $membership->price,
                'start_date' => $membership->start_date->format('Y-m-d'),
                'end_date' => $membership->end_date->format('Y-m-d'),
                'status' => $membership->status,
                'payment_status' => $membership->payment_status,
            ],
            gymId: $membership->gym_id
        );

        return redirect()->route('admin.memberships.show', $membership->id)
            ->with('success', 'Membership subscription created successfully.');
    }

    public function show(Membership $membership): Response
    {
        Gate::authorize('view', $membership);

        $membership->load([
            'member:id,gym_id,first_name,last_name,full_name,member_number,email,phone,address,emergency_contact,profile_photo',
            'membershipPlan:id,gym_id,name,description,price,billing_period,duration,trainer_quota,benefits',
            'gym:id,name,code,address',
            'attendances' => fn ($q) => $q->latest('check_in_at')->limit(10),
            'trainingSessions' => fn ($q) => $q->with(['workoutType', 'trainer'])->latest('started_at')->limit(10),
        ]);

        return Inertia::render('Admin/Memberships/Show', [
            'membership' => $membership,
        ]);
    }

    public function edit(Membership $membership): Response
    {
        Gate::authorize('update', $membership);

        $membership->load(['member:id,full_name,member_number', 'membershipPlan:id,name']);

        return Inertia::render('Admin/Memberships/Edit', [
            'membership' => $membership,
        ]);
    }

    public function update(
        UpdateMembershipRequest $request,
        Membership $membership,
        MembershipService $membershipService,
        AuditService $auditService
    ): RedirectResponse {
        $updated = $membershipService->updateMembership($membership, $request->validated());

        $auditService->log(
            action: 'membership.updated',
            entityType: Membership::class,
            entityId: $updated->id,
            metadata: [
                'status' => $updated->status,
                'payment_status' => $updated->payment_status,
                'start_date' => $updated->start_date->format('Y-m-d'),
                'end_date' => $updated->end_date->format('Y-m-d'),
            ],
            gymId: $updated->gym_id
        );

        return redirect()->route('admin.memberships.show', $updated->id)
            ->with('success', 'Membership subscription details updated successfully.');
    }
}