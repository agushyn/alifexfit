<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use App\Models\Trainer;
use App\Services\Tenancy\GymContext;
use App\Services\Website\PublicTenantResolver;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicWebsiteController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected PublicTenantResolver $tenantResolver,
        protected GymContext $gymContext
    ) {}

    /**
     * Homepage.
     */
    public function home(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);

        $branding = $this->websiteService->getPublicBranding($gym);
        $heroes = $this->websiteService->getPublicHeroes($gym);
        $sections = $this->websiteService->getPublicSections($gym);
        $plans = $this->websiteService->getPublicMembershipPlans($gym)->take(3);
        $trainers = $this->websiteService->getPublicTrainers($gym)->take(4);
        $workouts = $this->websiteService->getPublicWorkoutTypes($gym)->take(6);
        $facilities = $this->websiteService->getPublicFacilities($gym)->take(6);
        $faqs = $this->websiteService->getPublicFaqs($gym)->take(5);

        return Inertia::render('Public/Website/Home', [
            'branding' => $branding,
            'heroes' => $heroes,
            'sections' => $sections,
            'plans' => $plans,
            'trainers' => $trainers,
            'workouts' => $workouts,
            'facilities' => $facilities,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Membership plans catalog.
     */
    public function membership(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $plans = $this->websiteService->getPublicMembershipPlans($gym);
        $faqs = $this->websiteService->getPublicFaqs($gym, 'membership');

        return Inertia::render('Public/Website/Memberships', [
            'branding' => $branding,
            'plans' => $plans,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Trainers directory.
     */
    public function trainers(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $trainers = $this->websiteService->getPublicTrainers($gym);

        return Inertia::render('Public/Website/Trainers', [
            'branding' => $branding,
            'trainers' => $trainers,
        ]);
    }

    /**
     * Trainer public detail.
     */
    public function trainerDetail(Request $request, Trainer $trainer): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);

        // Security check: trainer must belong to current gym and be active
        if ($trainer->gym_id !== $gym->id || $trainer->status !== 'active') {
            abort(404, 'Trainer not found.');
        }

        $branding = $this->websiteService->getPublicBranding($gym);
        $trainer->load(['activeSchedules' => fn ($q) => $q->orderBy('day_of_week')->orderBy('start_time')]);

        $sanitizedTrainer = [
            'id' => $trainer->id,
            'name' => $trainer->name,
            'role' => $trainer->role ?: 'Certified Personal Trainer',
            'specialization' => $trainer->specialization ?: 'Strength & Conditioning',
            'certification' => $trainer->certification,
            'bio' => $trainer->bio,
            'profile_photo_url' => $trainer->profile_photo_url,
            'schedules' => $trainer->activeSchedules->map(fn ($s) => [
                'day_of_week' => $s->day_of_week,
                'day_name' => $s->day_name,
                'formatted_time_range' => $s->formatted_time_range,
            ]),
        ];

        return Inertia::render('Public/Website/TrainerShow', [
            'branding' => $branding,
            'trainer' => $sanitizedTrainer,
        ]);
    }

    /**
     * Workouts catalog.
     */
    public function workouts(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $workouts = $this->websiteService->getPublicWorkoutTypes($gym);

        return Inertia::render('Public/Website/Workouts', [
            'branding' => $branding,
            'workouts' => $workouts,
        ]);
    }

    /**
     * Facilities showcase.
     */
    public function facilities(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $facilities = $this->websiteService->getPublicFacilities($gym);

        return Inertia::render('Public/Website/Facilities', [
            'branding' => $branding,
            'facilities' => $facilities,
        ]);
    }

    /**
     * About gym page.
     */
    public function about(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $sections = $this->websiteService->getPublicSections($gym);
        $facilities = $this->websiteService->getPublicFacilities($gym)->take(4);

        return Inertia::render('Public/Website/About', [
            'branding' => $branding,
            'sections' => $sections,
            'facilities' => $facilities,
        ]);
    }

    /**
     * FAQ page.
     */
    public function faq(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $faqs = $this->websiteService->getPublicFaqs($gym);

        return Inertia::render('Public/Website/Faq', [
            'branding' => $branding,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Contact page.
     */
    public function contact(Request $request): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);

        return Inertia::render('Public/Website/Contact', [
            'branding' => $branding,
        ]);
    }

    /**
     * Dynamic CMS page.
     */
    public function page(Request $request, string $slug): Response
    {
        $gym = $this->gymContext->getGym() ?? $this->tenantResolver->resolve($request);
        $branding = $this->websiteService->getPublicBranding($gym);
        $page = $this->websiteService->getPublicPage($gym, $slug);

        if (! $page) {
            abort(404, 'Page not found.');
        }

        return Inertia::render('Public/Website/Page', [
            'branding' => $branding,
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'published_at' => $page->published_at?->format('d M Y'),
                'meta_title' => $page->meta_title ?? ($page->title . ' | ' . $gym->name),
                'meta_description' => $page->meta_description ?? $page->excerpt,
                'og_image_url' => $page->og_image_url,
            ],
        ]);
    }

    /**
     * Switch public branch.
     */
    public function switchBranch(Request $request): RedirectResponse
    {
        $gymId = $request->input('gym_id');
        $gym = Gym::where('id', $gymId)->where('status', 'active')->firstOrFail();

        $this->tenantResolver->switchBranch($gym);

        return back()->with('success', "Branch changed to {$gym->name}.");
    }
}
