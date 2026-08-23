<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignLeadRequest;
use App\Http\Requests\Admin\ChangeLeadStatusRequest;
use App\Http\Requests\Admin\ConvertLeadRequest;
use App\Http\Requests\Admin\RecordLeadContactRequest;
use App\Http\Requests\Admin\StoreAdminLeadRequest;
use App\Http\Requests\Admin\UpdateLeadRequest;
use App\Models\Lead;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\LeadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(
        protected LeadService $leadService
    ) {}

    /**
     * Display a listing of leads with filters & KPI statistics.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Lead::class);

        $search = $request->query('search');
        $status = $request->query('status');
        $source = $request->query('source');
        $interestType = $request->query('interest_type');
        $planId = $request->query('plan_id');
        $assignedTo = $request->query('assigned_to');
        $followUpDue = $request->boolean('follow_up_due');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $leads = Lead::query()
            ->with(['membershipPlan', 'assignedUser'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('lead_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($source, fn ($q) => $q->where('source', $source))
            ->when($interestType, fn ($q) => $q->where('interest_type', $interestType))
            ->when($planId, fn ($q) => $q->where('membership_plan_id', $planId))
            ->when($assignedTo, fn ($q) => $q->where('assigned_to', $assignedTo))
            ->when($followUpDue, fn ($q) => $q->followUpDue())
            ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Lead::count(),
            'new' => Lead::new()->count(),
            'contacted' => Lead::contacted()->count(),
            'qualified' => Lead::qualified()->count(),
            'interested' => Lead::interested()->count(),
            'converted' => Lead::converted()->count(),
            'follow_up_due' => Lead::followUpDue()->count(),
        ];

        $membershipPlans = MembershipPlan::ordered()->active()->get(['id', 'name', 'price']);

        $gymId = $request->user()->gym_id;
        $staffUsers = User::query()
            ->when($gymId, fn ($q) => $q->where('gym_id', $gymId))
            ->where('status', 'active')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $leads,
            'stats' => $stats,
            'membershipPlans' => $membershipPlans,
            'staffUsers' => $staffUsers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'source' => $source,
                'interest_type' => $interestType,
                'plan_id' => $planId,
                'assigned_to' => $assignedTo,
                'follow_up_due' => $followUpDue,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Show the form for creating a new lead manually.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Lead::class);

        $membershipPlans = MembershipPlan::ordered()->active()->get(['id', 'name', 'price', 'duration']);

        $gymId = $request->user()->gym_id;
        $staffUsers = User::query()
            ->when($gymId, fn ($q) => $q->where('gym_id', $gymId))
            ->where('status', 'active')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Leads/Create', [
            'membershipPlans' => $membershipPlans,
            'staffUsers' => $staffUsers,
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreAdminLeadRequest $request): RedirectResponse
    {
        $lead = $this->leadService->createAdminLead($request->validated(), $request->user());

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', "Prospek #{$lead->lead_number} berhasil didaftarkan.");
    }

    /**
     * Display the specified lead details.
     */
    public function show(Lead $lead): Response
    {
        Gate::authorize('view', $lead);

        $lead->load([
            'membershipPlan',
            'assignedUser',
            'activities.user',
            'membershipRegistration.member',
            'membershipRegistration.membership',
            'gym',
        ]);

        $membershipPlans = MembershipPlan::ordered()->active()->get(['id', 'name', 'price', 'duration', 'billing_period']);

        $gymId = $lead->gym_id;
        $staffUsers = User::query()
            ->where('gym_id', $gymId)
            ->where('status', 'active')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Leads/Show', [
            'lead' => $lead,
            'membershipPlans' => $membershipPlans,
            'staffUsers' => $staffUsers,
        ]);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $this->leadService->updateLead($lead, $request->validated(), $request->user());

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', 'Data prospek berhasil diperbarui.');
    }

    /**
     * Assign lead to a staff member.
     */
    public function assign(AssignLeadRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('assign', $lead);

        $assignee = $request->input('assigned_to') ? User::find($request->input('assigned_to')) : null;
        $this->leadService->assignLead($lead, $assignee, $request->user());

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', 'Penugasan staff prospek berhasil diperbarui.');
    }

    /**
     * Update lead pipeline status.
     */
    public function updateStatus(ChangeLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $this->leadService->changeStatus($lead, $request->input('status'), $request->user(), $request->input('reason'));

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', "Status prospek berhasil diperbarui ke '{$request->input('status')}'.");
    }

    /**
     * Record a contact / follow-up activity.
     */
    public function recordContact(RecordLeadContactRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('contact', $lead);

        $this->leadService->recordContact($lead, $request->validated(), $request->user());

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', 'Aktivitas follow-up berhasil dicatat.');
    }

    /**
     * Convert lead to pending membership registration.
     */
    public function convert(ConvertLeadRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('convert', $lead);

        $registration = $this->leadService->convertLead($lead, $request->user(), $request->validated());

        return redirect()->route('admin.leads.show', $lead->id)
            ->with('success', "Prospek #{$lead->lead_number} berhasil dikonversi menjadi Permohonan Pendaftaran #{$registration->registration_number}.");
    }
}
