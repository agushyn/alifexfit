<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveMembershipRegistrationRequest;
use App\Http\Requests\Admin\RejectMembershipRegistrationRequest;
use App\Http\Requests\Admin\StoreOnsiteMembershipRegistrationRequest;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Services\Memberships\MembershipRegistrationService;
use App\Services\Storage\SecureStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MembershipRegistrationController extends Controller
{
    public function __construct(
        protected MembershipRegistrationService $registrationService
    ) {}

    /**
     * Display a listing of membership registrations.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', MembershipRegistration::class);

        $search = $request->query('search');
        $status = $request->query('status');
        $paymentStatus = $request->query('payment_status');
        $source = $request->query('source');
        $planId = $request->query('plan_id');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $registrations = MembershipRegistration::query()
            ->with(['membershipPlan', 'reviewer', 'latestPayment'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('registration_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($paymentStatus, fn ($q) => $q->where('payment_status', $paymentStatus))
            ->when($source, fn ($q) => $q->where('source', $source))
            ->when($planId, fn ($q) => $q->where('membership_plan_id', $planId))
            ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => MembershipRegistration::count(),
            'pending' => MembershipRegistration::pending()->count(),
            'approved' => MembershipRegistration::approved()->count(),
            'rejected' => MembershipRegistration::rejected()->count(),
            'cancelled' => MembershipRegistration::cancelled()->count(),
            'paid' => MembershipRegistration::paid()->count(),
            'payment_pending' => MembershipRegistration::paymentPending()->count(),
            'onsite' => MembershipRegistration::where('source', 'admin')->count(),
            'website' => MembershipRegistration::where('source', 'website')->count(),
        ];

        $membershipPlans = MembershipPlan::ordered()->active()->get(['id', 'name', 'price', 'billing_period']);

        return Inertia::render('Admin/MembershipRegistrations/Index', [
            'registrations' => $registrations,
            'stats' => $stats,
            'membershipPlans' => $membershipPlans,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'source' => $source,
                'plan_id' => $planId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Display the onsite walk-in member registration form.
     */
    public function createOnsite(): Response
    {
        Gate::authorize('create', MembershipRegistration::class);

        $membershipPlans = MembershipPlan::ordered()
            ->active()
            ->get(['id', 'name', 'price', 'billing_period', 'duration', 'trainer_quota', 'benefits', 'featured']);

        return Inertia::render('Admin/MembershipRegistrations/OnsiteCreate', [
            'membershipPlans' => $membershipPlans,
        ]);
    }

    /**
     * Handle onsite walk-in member registration submission.
     */
    public function storeOnsite(StoreOnsiteMembershipRegistrationRequest $request): RedirectResponse
    {
        $registration = $this->registrationService->registerOnsite(
            data: $request->validated(),
            creator: $request->user(),
            photo: $request->file('photo')
        );

        return redirect()->route('admin.membership-registrations.onsite.success', $registration->id)
            ->with('success', "Member {$registration->member?->full_name} ({$registration->member?->member_number}) berhasil didaftarkan secara onsite.");
    }

    /**
     * Display onsite registration success receipt.
     */
    public function successOnsite(MembershipRegistration $registration): Response
    {
        Gate::authorize('view', $registration);

        $registration->load([
            'member',
            'membership',
            'membershipPlan',
            'reviewer',
            'gym',
        ]);

        return Inertia::render('Admin/MembershipRegistrations/OnsiteSuccess', [
            'registration' => $registration,
        ]);
    }

    /**
     * Display a specific registration application.
     */
    public function show(MembershipRegistration $registration): Response
    {
        Gate::authorize('view', $registration);

        $registration->load([
            'membershipPlan',
            'reviewer',
            'member',
            'membership',
            'gym',
            'payments' => fn ($q) => $q->latest('id'),
            'latestPayment',
        ]);

        return Inertia::render('Admin/MembershipRegistrations/Show', [
            'registration' => $registration,
        ]);
    }

    /**
     * Securely stream uploaded KTP document for authorized admin.
     */
    public function showKtp(
        Request $request,
        MembershipRegistration $registration,
        SecureStorageService $storageService
    ): SymfonyResponse {
        Gate::authorize('view', $registration);

        $path = $registration->ktp_document_path;

        if (! $path || ! Storage::disk('local')->exists($path)) {
            abort(404, 'KTP document not found.');
        }

        if (! $storageService->canUserAccessPrivateFile($request->user(), $path)) {
            abort(403, 'Unauthorized access to private KTP document.');
        }

        return Storage::disk('local')->response($path);
    }

    /**
     * Approve a pending registration manually.
     */
    public function approve(
        ApproveMembershipRegistrationRequest $request,
        MembershipRegistration $registration
    ): RedirectResponse {
        $approved = $this->registrationService->approveRegistration(
            registration: $registration,
            reviewer: $request->user(),
            approvalData: $request->validated()
        );

        return redirect()->route('admin.membership-registrations.show', $approved->id)
            ->with('success', "Pendaftaran #{$approved->registration_number} berhasil disetujui. Member {$approved->member?->full_name} ({$approved->member?->member_number}) telah dibuat.");
    }

    /**
     * Retry automatic member activation for an already-paid registration (Recovery).
     */
    public function retryActivation(
        Request $request,
        MembershipRegistration $registration
    ): RedirectResponse {
        Gate::authorize('approve', $registration);

        $activated = $this->registrationService->retryActivation(
            registration: $registration,
            admin: $request->user()
        );

        return redirect()->route('admin.membership-registrations.show', $activated->id)
            ->with('success', "Aktivasi member untuk #{$activated->registration_number} berhasil diselesaikan. Member {$activated->member?->full_name} ({$activated->member?->member_number}) aktif.");
    }

    /**
     * Reject a pending registration.
     */
    public function reject(
        RejectMembershipRegistrationRequest $request,
        MembershipRegistration $registration
    ): RedirectResponse {
        $rejected = $this->registrationService->rejectRegistration(
            registration: $registration,
            reviewer: $request->user(),
            reason: $request->input('rejection_reason')
        );

        return redirect()->route('admin.membership-registrations.show', $rejected->id)
            ->with('success', "Pendaftaran #{$rejected->registration_number} telah ditolak.");
    }

    /**
     * Cancel a pending registration.
     */
    public function cancel(Request $request, MembershipRegistration $registration): RedirectResponse
    {
        Gate::authorize('cancel', $registration);

        $cancelled = $this->registrationService->cancelRegistration(
            registration: $registration,
            user: $request->user(),
            reason: $request->input('reason')
        );

        return redirect()->route('admin.membership-registrations.show', $cancelled->id)
            ->with('success', "Pendaftaran #{$cancelled->registration_number} telah dibatalkan.");
    }
}
