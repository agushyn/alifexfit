<?php

namespace App\Services\Website;

use App\Models\Gym;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\Request;

class PublicTenantResolver
{
    public function __construct(
        protected GymContext $gymContext
    ) {}

    /**
     * Resolve the active gym for a public request.
     */
    public function resolve(Request $request): Gym
    {
        $gym = null;

        // 1. Check query parameter `gym` (can be slug, code, or ID)
        $gymParam = $request->query('gym') ?? $request->route('gym');
        if ($gymParam) {
            $gym = Gym::where('status', 'active')
                ->where(function ($query) use ($gymParam) {
                    $query->where('slug', $gymParam)
                        ->orWhere('code', $gymParam);
                    if (is_numeric($gymParam)) {
                        $query->orWhere('id', (int) $gymParam);
                    }
                })->first();

            if ($gym) {
                session(['public_gym_id' => $gym->id]);
            }
        }

        // 2. Check session `public_gym_id`
        if (! $gym && session('public_gym_id')) {
            $gym = Gym::where('id', session('public_gym_id'))->where('status', 'active')->first();
        }

        // 3. Fallback to first active gym
        if (! $gym) {
            $gym = Gym::where('status', 'active')->orderBy('id')->first();
            if ($gym) {
                session(['public_gym_id' => $gym->id]);
            }
        }

        if (! $gym) {
            abort(503, 'No active gym branch configured in the system.');
        }

        // Bind resolved gym into GymContext
        $this->gymContext->setGym($gym);

        return $gym;
    }

    /**
     * Switch public branch to a specific gym.
     */
    public function switchBranch(Gym $gym): void
    {
        if ($gym->status !== 'active') {
            abort(400, 'Selected gym branch is inactive.');
        }

        session(['public_gym_id' => $gym->id]);
        $this->gymContext->setGym($gym);
    }
}
