<?php

namespace App\Scopes;

use App\Services\Tenancy\GymContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class GymScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        /** @var GymContext $context */
        $context = app(GymContext::class);

        if ($context->isBypassed()) {
            return;
        }

        $gymId = $context->getGymId();

        if ($gymId !== null) {
            $builder->where($model->getTable() . '.gym_id', $gymId);
        }
    }
}
