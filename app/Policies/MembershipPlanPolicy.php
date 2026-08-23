<?php

namespace App\Policies;

use App\Models\MembershipPlan;
use App\Models\User;

class MembershipPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('membership.view');
    }

    public function view(User $user, MembershipPlan $plan): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.view') && (int) $user->gym_id === (int) $plan->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('membership.manage');
    }

    public function update(User $user, MembershipPlan $plan): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.manage') && (int) $user->gym_id === (int) $plan->gym_id;
    }

    public function delete(User $user, MembershipPlan $plan): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.manage') && (int) $user->gym_id === (int) $plan->gym_id;
    }
}