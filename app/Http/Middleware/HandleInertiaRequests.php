<?php

namespace App\Http\Middleware;

use App\Models\Gym;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        /** @var GymContext $gymContext */
        $gymContext = app(GymContext::class);

        $currentGym = $gymContext->getGym();
        $availableGyms = [];
        $activeBranches = Gym::where('status', 'active')->select(['id', 'name', 'slug', 'code', 'phone', 'address'])->get();

        if ($user && $user->isSuperAdmin()) {
            $availableGyms = Gym::select(['id', 'name', 'slug', 'code', 'status'])->get();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'avatar' => $user->avatar,
                    'gym_id' => $user->gym_id,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'roles' => $user->role_names,
                    'permissions' => $user->permission_names,
                ] : null,
            ],
            'gym' => [
                'current' => $currentGym ? [
                    'id' => $currentGym->id,
                    'name' => $currentGym->name,
                    'slug' => $currentGym->slug,
                    'code' => $currentGym->code,
                    'phone' => $currentGym->phone,
                    'email' => $currentGym->email,
                    'address' => $currentGym->address,
                    'logo' => $currentGym->logo,
                    'timezone' => $currentGym->timezone,
                    'status' => $currentGym->status,
                ] : null,
                'available' => $availableGyms,
                'branches' => $activeBranches,
                'is_super_admin' => $user ? $user->isSuperAdmin() : false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
