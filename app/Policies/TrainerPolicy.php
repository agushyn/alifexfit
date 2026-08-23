<?php

namespace App\Policies;

use App\Models\Trainer;
use App\Models\User;

class TrainerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('trainers.view')
            || $user->hasPermission('trainers.manage')
            || $user->isSuperAdmin();
    }

    public function view(User $user, Trainer $trainer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('trainers.view') || $user->hasPermission('trainers.manage'))
            && (int) $user->gym_id === (int) $trainer->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('trainers.manage')
            || $user->hasPermission('trainers.create')
            || $user->isSuperAdmin();
    }

    public function update(User $user, Trainer $trainer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('trainers.manage') || $user->hasPermission('trainers.update'))
            && (int) $user->gym_id === (int) $trainer->gym_id;
    }

    public function delete(User $user, Trainer $trainer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('trainers.manage') || $user->hasPermission('trainers.delete'))
            && (int) $user->gym_id === (int) $trainer->gym_id;
    }

    public function restore(User $user, Trainer $trainer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('trainers.manage') || $user->hasPermission('trainers.delete'))
            && (int) $user->gym_id === (int) $trainer->gym_id;
    }

    public function manageSchedule(User $user, Trainer $trainer): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('trainers.manage') || $user->hasPermission('trainers.manage_schedule') || $user->hasPermission('trainers.update'))
            && (int) $user->gym_id === (int) $trainer->gym_id;
    }
}
