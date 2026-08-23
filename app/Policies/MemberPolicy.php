<?php

namespace App\Policies;

use App\Models\Member;
use App\Models\User;

class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('members.view');
    }

    public function view(User $user, Member $member): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('members.view') && (int) $user->gym_id === (int) $member->gym_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('members.create');
    }

    public function update(User $user, Member $member): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('members.update') && (int) $user->gym_id === (int) $member->gym_id;
    }

    public function delete(User $user, Member $member): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->hasPermission('members.delete') && (int) $user->gym_id === (int) $member->gym_id;
    }
}