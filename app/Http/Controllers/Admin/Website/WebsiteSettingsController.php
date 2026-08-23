<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWebsiteSettingsRequest;
use App\Models\GymSetting;
use App\Services\Settings\SettingService;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingsController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected SettingService $settingService,
        protected GymContext $gymContext
    ) {}

    public function edit(Request $request): Response
    {
        Gate::authorize('viewAny', GymSetting::class);

        $gym = $this->gymContext->getGym();
        $gymId = $gym?->id;

        $branding = $this->websiteService->getPublicBranding($gym);

        return Inertia::render('Admin/Website/Settings', [
            'settings' => $branding['settings'],
            'gym' => $branding['gym'],
        ]);
    }

    public function update(UpdateWebsiteSettingsRequest $request): RedirectResponse
    {
        $gymId = $this->gymContext->getGymId();
        $validated = $request->validated();

        if ($request->hasFile('og_image')) {
            $currentOgImage = $this->settingService->get('og_image', null, $gymId, 'website');
            if ($currentOgImage && Storage::disk('public')->exists($currentOgImage)) {
                Storage::disk('public')->delete($currentOgImage);
            }
            $validated['og_image'] = $request->file('og_image')->store('website/og', 'public');
        }

        $this->websiteService->updateWebsiteSettings($validated, $gymId);

        return redirect()->route('admin.website.settings.edit')
            ->with('success', 'Pengaturan website dan branding publik berhasil diperbarui.');
    }
}
