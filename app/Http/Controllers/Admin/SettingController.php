<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\GymSetting;
use App\Services\Audit\AuditService;
use App\Services\Settings\SettingService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request, SettingService $settingService, GymContext $gymContext): Response
    {
        Gate::authorize('viewAny', GymSetting::class);

        $currentGym = $gymContext->getGym();
        $user = $request->user();

        $gymSettings = $currentGym ? GymSetting::where('gym_id', $currentGym->id)->get() : collect();
        $systemSettings = $user->isSuperAdmin() ? GymSetting::whereNull('gym_id')->get() : collect();

        return Inertia::render('Admin/Settings/Index', [
            'gymSettings' => $gymSettings,
            'systemSettings' => $systemSettings,
        ]);
    }

    public function update(UpdateSettingsRequest $request, SettingService $settingService, GymContext $gymContext, AuditService $auditService): RedirectResponse
    {
        $settings = $request->validated('settings');
        $gymId = $request->input('gym_id', $gymContext->getGymId());

        // Non-super-admins cannot update settings for a gym they don't belong to or global settings
        if (!$request->user()->isSuperAdmin()) {
            $gymId = $request->user()->gym_id;
        }

        foreach ($settings as $item) {
            $settingService->set(
                key: $item['key'],
                value: $item['value'] ?? '',
                group: $item['group'] ?? 'general',
                gymId: $gymId
            );
        }

        $auditService->log(
            action: 'settings.updated',
            entityType: GymSetting::class,
            metadata: ['count' => count($settings), 'gym_id' => $gymId],
            gymId: $gymId
        );

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
