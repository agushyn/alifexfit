<?php

namespace App\Policies;

use App\Models\Gym;
use App\Models\User;

class GymPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('gyms.view');
    }

    public function view(User $user, Gym $gym): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('gyms.view') && (int) $user->gym_id === (int) $gym->id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('gyms.create');
    }

    public function update(User $user, Gym $gym): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('gyms.update') && (int) $user->gym_id === (int) $gym->id;
    }

    public function delete(User $user, Gym $gym): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('gyms.delete');
    }
}
