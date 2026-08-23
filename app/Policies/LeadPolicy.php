<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    /**
     * Determine whether the user can view any leads.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('leads.view');
    }

    /**
     * Determine whether the user can view the specific lead.
     */
    public function view(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.view')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can create leads.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('leads.create');
    }

    /**
     * Determine whether the user can update the lead.
     */
    public function update(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.update')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can assign the lead.
     */
    public function assign(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.assign')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can record contact activity for the lead.
     */
    public function contact(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.contact')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can convert the lead to a membership registration.
     */
    public function convert(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.convert')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can manage/delete the lead.
     */
    public function manage(User $user, Lead $lead): bool
    {
        if (! $user->hasPermission('leads.manage')) {
            return false;
        }

        return $user->isSuperAdmin() || $user->gym_id === $lead->gym_id;
    }

    /**
     * Determine whether the user can delete the lead.
     */
    public function delete(User $user, Lead $lead): bool
    {
        return $this->manage($user, $lead);
    }
}
