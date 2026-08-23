<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request, GymContext $gymContext): Response
    {
        Gate::authorize('viewAny', AuditLog::class);

        $user = $request->user();
        $action = $request->query('action');
        $search = $request->query('search');

        $query = AuditLog::with(['user:id,name,email', 'gym:id,name,code'])
            ->when(!$user->isSuperAdmin(), function ($q) use ($user) {
                $q->where('gym_id', $user->gym_id);
            })
            ->when($action, fn ($q) => $q->where('action', 'like', "%{$action}%"))
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('action', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $query,
            'filters' => [
                'action' => $action,
                'search' => $search,
            ],
        ]);
    }
}
