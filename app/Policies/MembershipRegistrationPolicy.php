<?php

namespace App\Policies;

use App\Models\MembershipRegistration;
use App\Models\User;

class MembershipRegistrationPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('membership_registrations.view')
            || $user->hasPermission('membership_registrations.manage');
    }

    public function view(User $user, MembershipRegistration $registration): bool
    {
        if (! ($user->hasPermission('membership_registrations.view') || $user->hasPermission('membership_registrations.manage'))) {
            return false;
        }

        return (int) $user->gym_id === (int) $registration->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('membership_registrations.create')
            || $user->hasPermission('membership_registrations.manage');
    }

    public function approve(User $user, MembershipRegistration $registration): bool
    {
        if (! ($user->hasPermission('membership_registrations.approve') || $user->hasPermission('membership_registrations.manage'))) {
            return false;
        }

        return (int) $user->gym_id === (int) $registration->gym_id;
    }

    public function reject(User $user, MembershipRegistration $registration): bool
    {
        if (! ($user->hasPermission('membership_registrations.reject') || $user->hasPermission('membership_registrations.manage'))) {
            return false;
        }

        return (int) $user->gym_id === (int) $registration->gym_id;
    }

    public function cancel(User $user, MembershipRegistration $registration): bool
    {
        if (! ($user->hasPermission('membership_registrations.cancel') || $user->hasPermission('membership_registrations.manage'))) {
            return false;
        }

        return (int) $user->gym_id === (int) $registration->gym_id;
    }

    public function delete(User $user, MembershipRegistration $registration): bool
    {
        if (! $user->hasPermission('membership_registrations.manage')) {
            return false;
        }

        return (int) $user->gym_id === (int) $registration->gym_id;
    }
}
