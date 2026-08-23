<?php

namespace App\Policies;

use App\Models\TrainingSession;
use App\Models\User;

class TrainingSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('workout_sessions.view')
            || $user->hasPermission('workout.view')
            || $user->isSuperAdmin();
    }

    public function view(User $user, TrainingSession $trainingSession): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('workout_sessions.view') || $user->hasPermission('workout.view'))
            && (int) $user->gym_id === (int) $trainingSession->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('workout_sessions.create')
            || $user->hasPermission('workout.manage')
            || $user->isSuperAdmin();
    }

    public function update(User $user, TrainingSession $trainingSession): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('workout_sessions.update') || $user->hasPermission('workout.manage'))
            && (int) $user->gym_id === (int) $trainingSession->gym_id;
    }

    public function delete(User $user, TrainingSession $trainingSession): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('workout_sessions.delete') || $user->hasPermission('workout.manage'))
            && (int) $user->gym_id === (int) $trainingSession->gym_id;
    }
}