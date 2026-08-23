<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePublicLeadRequest;
use App\Models\MembershipPlan;
use App\Services\LeadService;
use App\Services\Website\PublicTenantResolver;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicLeadController extends Controller
{
    public function __construct(
        protected LeadService $leadService,
        protected PublicTenantResolver $tenantResolver,
        protected WebsiteService $websiteService
    ) {}

    /**
     * Display the public lead inquiry / consultation capture form.
     */
    public function create(Request $request): Response
    {
        $gym = $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);

        $plans = MembershipPlan::withoutGymScope()
            ->where('gym_id', $gym->id)
            ->where('status', 'active')
            ->ordered()
            ->get(['id', 'name', 'price', 'duration', 'billing_period', 'trainer_quota']);

        $preselectedPlanId = $request->query('plan_id');

        return Inertia::render('Public/LeadCapture', [
            'branding' => $branding,
            'plans' => $plans,
            'preselectedPlanId' => $preselectedPlanId ? (int) $preselectedPlanId : null,
        ]);
    }

    /**
     * Handle public lead submission.
     */
    public function store(StorePublicLeadRequest $request): RedirectResponse
    {
        $gym = $this->tenantResolver->resolve($request);
        $lead = $this->leadService->createPublicLead($request->validated(), $gym->id);

        return redirect()->route('public.leads.success', [
            'ref' => $lead->lead_number,
            'gym' => $gym->slug,
        ]);
    }

    /**
     * Display public lead submission success screen.
     */
    public function success(Request $request): Response
    {
        $gym = $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $ref = $request->query('ref');

        return Inertia::render('Public/LeadSuccess', [
            'branding' => $branding,
            'ref' => $ref,
        ]);
    }
}
