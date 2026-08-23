<?php

namespace App\Policies;

use App\Models\Gym;
use App\Models\User;
use App\Models\WebsiteFacility;
use App\Models\WebsiteFaq;
use App\Models\WebsitePage;
use App\Models\WebsiteSection;

class WebsitePolicy
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
        return $user->hasPermission('website.view') || $user->hasPermission('website.manage');
    }

    public function view(User $user, mixed $model = null): bool
    {
        if (! ($user->hasPermission('website.view') || $user->hasPermission('website.manage'))) {
            return false;
        }

        if (is_object($model) && isset($model->gym_id)) {
            return $user->gym_id === $model->gym_id;
        }

        return true;
    }

    public function manage(User $user, mixed $model = null): bool
    {
        if (! $user->hasPermission('website.manage')) {
            return false;
        }

        if (is_object($model) && isset($model->gym_id)) {
            return $user->gym_id === $model->gym_id;
        }

        if ($model instanceof Gym) {
            return $user->gym_id === $model->id;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('website.manage');
    }

    public function createPage(User $user): bool
    {
        return $user->hasPermission('website.manage');
    }

    public function viewPage(User $user, mixed $model = null): bool
    {
        return $this->view($user, $model);
    }

    public function update(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function updatePage(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function delete(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function deletePage(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function manageFaq(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function manageFacility(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }

    public function manageSection(User $user, mixed $model = null): bool
    {
        return $this->manage($user, $model);
    }
}
