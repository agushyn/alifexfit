<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('attendance.view')
            || $user->hasPermission('attendance.kiosk')
            || $user->isSuperAdmin();
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('attendance.view') && (int) $user->gym_id === (int) $attendance->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('attendance.create')
            || $user->hasPermission('attendance.kiosk')
            || $user->isSuperAdmin();
    }

    public function update(User $user, Attendance $attendance): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return ($user->hasPermission('attendance.update') || $user->hasPermission('attendance.kiosk'))
            && (int) $user->gym_id === (int) $attendance->gym_id;
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('attendance.delete') && (int) $user->gym_id === (int) $attendance->gym_id;
    }

    public function kiosk(User $user): bool
    {
        return $user->hasPermission('attendance.kiosk')
            || $user->hasPermission('attendance.view')
            || $user->isSuperAdmin();
    }
}