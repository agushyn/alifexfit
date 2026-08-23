<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWebsiteSectionRequest;
use App\Models\WebsiteSection;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSectionController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected GymContext $gymContext
    ) {}

    public function index(): Response
    {
        Gate::authorize('manageSection', WebsiteSection::class);

        $gymId = $this->gymContext->getGymId();
        $sections = WebsiteSection::where('gym_id', $gymId)->ordered()->get();

        $defaultSectionKeys = [
            'hero' => 'Homepage Hero Banner',
            'about_preview' => 'About Gym Preview',
            'features' => 'Feature Highlights',
            'cta_banner' => 'High Voltage CTA Banner',
        ];

        return Inertia::render('Admin/Website/Sections/Index', [
            'sections' => $sections,
            'defaultSectionKeys' => $defaultSectionKeys,
        ]);
    }

    public function edit(string $sectionKey): Response
    {
        Gate::authorize('manageSection', WebsiteSection::class);

        $gymId = $this->gymContext->getGymId();
        $section = WebsiteSection::firstOrNew([
            'gym_id' => $gymId,
            'section_key' => $sectionKey,
        ]);

        return Inertia::render('Admin/Website/Sections/Edit', [
            'section' => $section,
            'sectionKey' => $sectionKey,
        ]);
    }

    public function update(UpdateWebsiteSectionRequest $request, string $sectionKey): RedirectResponse
    {
        $this->websiteService->updateSection(
            sectionKey: $sectionKey,
            data: $request->validated(),
            image: $request->file('image')
        );

        return redirect()->route('admin.website.sections.index')
            ->with('success', "Section '{$sectionKey}' berhasil diperbarui.");
    }
}
