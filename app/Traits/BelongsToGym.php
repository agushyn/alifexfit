<?php

namespace App\Traits;

use App\Models\Gym;
use App\Scopes\GymScope;
use App\Services\Tenancy\GymContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToGym
{
    public static function bootBelongsToGym(): void
    {
        static::addGlobalScope(new GymScope());

        static::creating(function ($model) {
            if (empty($model->gym_id)) {
                $context = app(GymContext::class);
                $gymId = $context->getGymId();
                if ($gymId !== null) {
                    $model->gym_id = $gymId;
                }
            }
        });
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class, 'gym_id');
    }

    public function scopeWithoutGymScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope(GymScope::class);
    }

    public function scopeForGym(Builder $query, int $gymId): Builder
    {
        return $query->withoutGlobalScope(GymScope::class)->where($this->getTable() . '.gym_id', $gymId);
    }
}
