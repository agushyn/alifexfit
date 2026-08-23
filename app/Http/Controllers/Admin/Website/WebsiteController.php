<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Models\WebsiteFacility;
use App\Models\WebsiteFaq;
use App\Models\WebsitePage;
use App\Models\WebsiteSection;
use App\Services\Settings\SettingService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteController extends Controller
{
    public function __construct(
        protected GymContext $gymContext,
        protected SettingService $settingService
    ) {}

    /**
     * CMS Overview Dashboard.
     */
    public function overview(Request $request): Response
    {
        Gate::authorize('viewAny', WebsitePage::class);

        $gym = $this->gymContext->getGym();
        $gymId = $gym?->id;

        $stats = [
            'total_pages' => WebsitePage::where('gym_id', $gymId)->count(),
            'published_pages' => WebsitePage::where('gym_id', $gymId)->published()->count(),
            'draft_pages' => WebsitePage::where('gym_id', $gymId)->draft()->count(),
            'total_faqs' => WebsiteFaq::where('gym_id', $gymId)->count(),
            'published_faqs' => WebsiteFaq::where('gym_id', $gymId)->published()->count(),
            'total_facilities' => WebsiteFacility::where('gym_id', $gymId)->count(),
            'active_facilities' => WebsiteFacility::where('gym_id', $gymId)->active()->count(),
            'total_sections' => WebsiteSection::where('gym_id', $gymId)->count(),
        ];

        $settings = $this->settingService->all($gymId, 'website');
        $recentPages = WebsitePage::where('gym_id', $gymId)->latest()->take(5)->get();
        $facilities = WebsiteFacility::where('gym_id', $gymId)->ordered()->take(6)->get();

        return Inertia::render('Admin/Website/Overview', [
            'stats' => $stats,
            'websiteSettings' => $settings,
            'recentPages' => $recentPages,
            'facilities' => $facilities,
        ]);
    }
}
