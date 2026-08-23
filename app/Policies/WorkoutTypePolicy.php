<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkoutType;

class WorkoutTypePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('workout.view');
    }

    public function view(User $user, WorkoutType $workoutType): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('workout.view') && (int) $user->gym_id === (int) $workoutType->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('workout.manage');
    }

    public function update(User $user, WorkoutType $workoutType): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('workout.manage') && (int) $user->gym_id === (int) $workoutType->gym_id;
    }

    public function delete(User $user, WorkoutType $workoutType): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('workout.manage') && (int) $user->gym_id === (int) $workoutType->gym_id;
    }
}