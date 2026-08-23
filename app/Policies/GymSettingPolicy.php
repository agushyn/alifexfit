<?php

namespace App\Policies;

use App\Models\GymSetting;
use App\Models\User;

class GymSettingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('settings.view');
    }

    public function view(User $user, GymSetting $setting): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->hasPermission('settings.view')) {
            return false;
        }

        return $setting->gym_id === null || (int) $user->gym_id === (int) $setting->gym_id;
    }

    public function update(User $user, GymSetting $setting): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->hasPermission('settings.manage')) {
            return false;
        }

        // Non-super-admins cannot edit global/system settings
        if ($setting->gym_id === null) {
            return false;
        }

        return (int) $user->gym_id === (int) $setting->gym_id;
    }

    public function manage(User $user): bool
    {
        return $user->isSuperAdmin() || $user->hasPermission('settings.manage');
    }
}
