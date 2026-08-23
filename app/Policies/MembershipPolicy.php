<?php

namespace App\Policies;

use App\Models\Membership;
use App\Models\User;

class MembershipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('membership.view');
    }

    public function view(User $user, Membership $membership): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.view') && (int) $user->gym_id === (int) $membership->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('membership.manage');
    }

    public function update(User $user, Membership $membership): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.manage') && (int) $user->gym_id === (int) $membership->gym_id;
    }

    public function delete(User $user, Membership $membership): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('membership.manage') && (int) $user->gym_id === (int) $membership->gym_id;
    }
}