<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMemberRequest;
use App\Http\Requests\Admin\UpdateMemberRequest;
use App\Models\Member;
use App\Services\Audit\AuditService;
use App\Services\Members\MemberService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(Request $request, GymContext $gymContext): Response
    {
        Gate::authorize('viewAny', Member::class);

        $search = $request->query('search');
        $status = $request->query('status');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = Member::query()
            ->with('gym:id,name,code')
            ->when($search, fn ($q) => $q->search($search))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->latest('id');

        $members = $query->paginate(15)->withQueryString();

        // Quick status summary for metrics header
        $stats = [
            'total' => Member::count(),
            'active' => Member::active()->count(),
            'inactive' => Member::inactive()->count(),
            'suspended' => Member::suspended()->count(),
            'expired' => Member::expired()->count(),
        ];

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Member::class);

        return Inertia::render('Admin/Members/Create');
    }

    public function store(StoreMemberRequest $request, MemberService $memberService, AuditService $auditService): RedirectResponse
    {
        $member = $memberService->createMember(
            data: $request->validated(),
            photo: $request->file('photo')
        );

        $auditService->log(
            action: 'member.created',
            entityType: Member::class,
            entityId: $member->id,
            metadata: [
                'member_number' => $member->member_number,
                'name' => $member->full_name,
                'email' => $member->email,
                'gym_id' => $member->gym_id,
            ],
            gymId: $member->gym_id
        );

        return redirect()->route('admin.members.index')
            ->with('success', "Member {$member->full_name} ({$member->member_number}) registered successfully.");
    }

    public function show(Member $member): Response
    {
        Gate::authorize('view', $member);

        $member->load([
            'gym:id,name,code,phone,email,address',
            'activeMembership.membershipPlan',
            'memberships.membershipPlan',
            'activeAttendance',
            'latestAttendance',
            'attendances' => fn ($q) => $q->with('membership.membershipPlan')->latest('check_in_at')->limit(10),
            'trainingSessions' => fn ($q) => $q->with(['workoutType', 'trainer'])->latest('started_at')->limit(10),
        ]);

        return Inertia::render('Admin/Members/Show', [
            'member' => $member,
        ]);
    }

    public function edit(Member $member): Response
    {
        Gate::authorize('update', $member);

        $member->load('gym:id,name,code');

        return Inertia::render('Admin/Members/Edit', [
            'member' => $member,
        ]);
    }

    public function update(
        UpdateMemberRequest $request,
        Member $member,
        MemberService $memberService,
        AuditService $auditService
    ): RedirectResponse {
        $updatedMember = $memberService->updateMember(
            member: $member,
            data: $request->validated(),
            photo: $request->file('photo')
        );

        $auditService->log(
            action: 'member.updated',
            entityType: Member::class,
            entityId: $updatedMember->id,
            metadata: [
                'member_number' => $updatedMember->member_number,
                'name' => $updatedMember->full_name,
                'status' => $updatedMember->status,
            ],
            gymId: $updatedMember->gym_id
        );

        return redirect()->route('admin.members.show', $updatedMember->id)
            ->with('success', "Member {$updatedMember->full_name} profile updated successfully.");
    }

    public function destroy(Member $member, MemberService $memberService, AuditService $auditService): RedirectResponse
    {
        Gate::authorize('delete', $member);

        $memberNumber = $member->member_number;
        $memberName = $member->full_name;
        $gymId = $member->gym_id;

        $memberService->deleteMember($member);

        $auditService->log(
            action: 'member.deleted',
            entityType: Member::class,
            entityId: $member->id,
            metadata: [
                'member_number' => $memberNumber,
                'name' => $memberName,
            ],
            gymId: $gymId
        );

        return redirect()->route('admin.members.index')
            ->with('success', "Member {$memberName} ({$memberNumber}) was deactivated successfully.");
    }
}