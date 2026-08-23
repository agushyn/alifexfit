<?php

namespace App\Http\Middleware;

use App\Models\Gym;
use App\Services\Tenancy\GymContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureGymContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        /** @var GymContext $gymContext */
        $gymContext = app(GymContext::class);

        if (!$user) {
            $gymContext->clear();
            return $next($request);
        }

        if ($user->isSuperAdmin()) {
            $gymContext->setIsSuperAdmin(true);

            // Super Admin can switch gym context via session or request parameter
            $sessionGymId = session('active_gym_id');

            if ($sessionGymId) {
                $gym = Gym::find($sessionGymId);
                if ($gym) {
                    $gymContext->setGym($gym);
                } else {
                    session()->forget('active_gym_id');
                    $gymContext->setGymId(null);
                }
            } else {
                // If user has a default gym_id, we can use it, or default to first gym
                if ($user->gym_id) {
                    $gymContext->setGymId($user->gym_id);
                } else {
                    $firstGym = Gym::active()->first();
                    if ($firstGym) {
                        $gymContext->setGym($firstGym);
                        session(['active_gym_id' => $firstGym->id]);
                    }
                }
            }
        } else {
            // Normal user is strictly scoped to their assigned gym
            $gymContext->setIsSuperAdmin(false);

            if (!$user->gym_id) {
                abort(403, 'User is not assigned to any gym.');
            }

            $gym = Gym::find($user->gym_id);
            if (!$gym || !$gym->isActive()) {
                abort(403, 'Assigned gym is inactive or not found.');
            }

            $gymContext->setGym($gym);
        }

        return $next($request);
    }
}
