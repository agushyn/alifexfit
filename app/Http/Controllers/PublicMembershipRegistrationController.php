<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StoreMembershipRegistrationRequest;
use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Services\Memberships\MembershipRegistrationService;
use App\Services\Payments\PaymentService;
use App\Services\Tenancy\GymContext;
use App\Services\Website\PublicTenantResolver;
use App\Services\Website\WebsiteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicMembershipRegistrationController extends Controller
{
    public function __construct(
        protected MembershipRegistrationService $registrationService,
        protected PaymentService $paymentService,
        protected WebsiteService $websiteService,
        protected PublicTenantResolver $tenantResolver,
        protected GymContext $gymContext
    ) {}

    /**
     * Display the public registration form.
     */
    public function create(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);

        // Active plans for current gym tenant
        $activePlans = MembershipPlan::withoutGymScope()
            ->where('gym_id', $gym->id)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        // Optional pre-selected plan
        $planParam = $request->query('plan');
        $selectedPlanId = null;

        if ($planParam) {
            $matchedPlan = $activePlans->first(function ($p) use ($planParam) {
                return (string) $p->id === (string) $planParam || $p->slug === $planParam;
            });
            if ($matchedPlan) {
                $selectedPlanId = $matchedPlan->id;
            }
        }

        if (! $selectedPlanId && $activePlans->isNotEmpty()) {
            $selectedPlanId = $activePlans->firstWhere('is_featured', true)?->id ?? $activePlans->first()->id;
        }

        return Inertia::render('Public/MembershipRegistration', [
            'branding' => $branding,
            'plans' => $activePlans,
            'selectedPlanId' => $selectedPlanId,
        ]);
    }

    /**
     * Handle public registration submission.
     */
    public function store(StoreMembershipRegistrationRequest $request): RedirectResponse
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);

        $registration = $this->registrationService->createRegistration(
            data: $request->validated(),
            ktp: $request->file('ktp'),
            gymId: $gym->id,
            source: 'website'
        );

        return redirect()->route('public.membership.register.payment', [
            'registration' => $registration->registration_number,
            'gym' => $gym->slug,
        ])->with('success', 'Pendaftaran Anda berhasil dicatat. Silakan pilih metode pembayaran untuk mengaktifkan membership.');
    }

    /**
     * Display payment selection and instructions page.
     */
    public function payment(Request $request, string $registrationNumber): Response|RedirectResponse
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);

        $registration = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $gym->id)
            ->where('registration_number', $registrationNumber)
            ->with(['membershipPlan', 'latestPayment'])
            ->firstOrFail();

        // If already paid and active, redirect to success screen
        if ($registration->is_paid || $registration->is_approved) {
            return redirect()->route('public.membership.register.success', [
                'reg' => $registration->registration_number,
                'gym' => $gym->slug,
            ]);
        }

        $channels = $this->paymentService->getAvailableChannels();

        return Inertia::render('Public/MembershipPayment', [
            'branding' => $branding,
            'registration' => $registration,
            'channels' => $channels,
            'latestPayment' => $registration->latestPayment,
        ]);
    }

    /**
     * Process payment channel selection and initiate Midtrans transaction.
     */
    public function storePayment(Request $request, string $registrationNumber): RedirectResponse
    {
        $request->validate([
            'payment_channel' => ['required', 'string'],
        ]);

        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);

        $registration = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $gym->id)
            ->where('registration_number', $registrationNumber)
            ->with(['membershipPlan'])
            ->firstOrFail();

        $payment = $this->paymentService->createPaymentForRegistration(
            registration: $registration,
            channelKey: $request->input('payment_channel')
        );

        if ($payment->is_paid) {
            return redirect()->route('public.membership.register.success', [
                'reg' => $registration->registration_number,
                'gym' => $gym->slug,
            ])->with('success', 'Pembayaran berhasil dikonfirmasi dan membership Anda telah aktif!');
        }

        return redirect()->route('public.membership.register.payment', [
            'registration' => $registration->registration_number,
            'gym' => $gym->slug,
        ])->with('success', 'Sesi pembayaran berhasil dibuat. Silakan selesaikan pembayaran sesuai petunjuk.');
    }

    /**
     * Real-time polling endpoint to check payment and activation status.
     */
    public function paymentStatus(Request $request, string $registrationNumber): JsonResponse
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);

        $registration = MembershipRegistration::withoutGymScope()
            ->where('gym_id', $gym->id)
            ->where('registration_number', $registrationNumber)
            ->with(['latestPayment'])
            ->first();

        if (! $registration) {
            return response()->json(['error' => 'Registration not found'], 404);
        }

        // Check against provider if pending payment exists
        if ($registration->latestPayment && ! $registration->latestPayment->is_paid) {
            try {
                $this->paymentService->checkPaymentStatus($registration->latestPayment);
                $registration->refresh();
            } catch (\Throwable) {
                // Keep polling non-blocking
            }
        }

        return response()->json([
            'registration_number' => $registration->registration_number,
            'status' => $registration->status,
            'payment_status' => $registration->payment_status,
            'is_paid' => $registration->is_paid,
            'is_approved' => $registration->is_approved,
            'is_expired' => $registration->latestPayment?->is_expired ?? false,
            'redirect_url' => ($registration->is_paid || $registration->is_approved)
                ? route('public.membership.register.success', ['reg' => $registration->registration_number, 'gym' => $gym->slug])
                : null,
        ]);
    }

    /**
     * Display registration receipt & activation confirmation.
     */
    public function success(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);

        $regNumber = $request->query('reg');
        $registration = null;

        if ($regNumber) {
            $registration = MembershipRegistration::withoutGymScope()
                ->where('gym_id', $gym->id)
                ->where('registration_number', $regNumber)
                ->with(['membershipPlan', 'member', 'membership', 'latestPayment'])
                ->first();
        }

        return Inertia::render('Public/MembershipRegistrationSuccess', [
            'branding' => $branding,
            'registration' => $registration,
            'registrationNumber' => $regNumber,
        ]);
    }
}
