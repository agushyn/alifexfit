<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Gym;
use App\Models\GymSetting;
use App\Models\User;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, GymContext $gymContext): Response
    {
        $user = $request->user();
        $currentGym = $gymContext->getGym();

        $stats = [
            'total_gyms' => $user->isSuperAdmin() ? Gym::count() : 1,
            'active_gyms' => $user->isSuperAdmin() ? Gym::active()->count() : ($currentGym?->isActive() ? 1 : 0),
            'gym_users_count' => $currentGym ? User::where('gym_id', $currentGym->id)->count() : User::count(),
            'gym_settings_count' => $currentGym ? GymSetting::where('gym_id', $currentGym->id)->count() : GymSetting::count(),
            'audit_logs_count' => $currentGym ? AuditLog::where('gym_id', $currentGym->id)->count() : AuditLog::count(),
        ];

        $recentLogs = AuditLog::with('user:id,name,email')
            ->when($currentGym && !$user->isSuperAdmin(), function ($query) use ($currentGym) {
                $query->where('gym_id', $currentGym->id);
            })
            ->latest('id')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentLogs' => $recentLogs,
            'systemInfo' => [
                'laravel_version' => app()->version(),
                'php_version' => PHP_VERSION,
                'environment' => app()->environment(),
                'database_driver' => config('database.default'),
            ],
        ]);
    }
}
