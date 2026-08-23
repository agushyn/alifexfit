<?php

namespace App\Traits;

use App\Services\Audit\AuditService;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            app(AuditService::class)->log(
                action: strtolower(class_basename($model)) . '.created',
                entityType: get_class($model),
                entityId: $model->id,
                metadata: [
                    'attributes' => $model->getAttributes(),
                ],
                gymId: $model->gym_id ?? null
            );
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);

            if (!empty($changes)) {
                app(AuditService::class)->log(
                    action: strtolower(class_basename($model)) . '.updated',
                    entityType: get_class($model),
                    entityId: $model->id,
                    metadata: [
                        'changes' => $changes,
                        'original' => array_intersect_key($model->getOriginal(), $changes),
                    ],
                    gymId: $model->gym_id ?? null
                );
            }
        });

        static::deleted(function ($model) {
            app(AuditService::class)->log(
                action: strtolower(class_basename($model)) . '.deleted',
                entityType: get_class($model),
                entityId: $model->id,
                metadata: [
                    'attributes' => $model->getAttributes(),
                ],
                gymId: $model->gym_id ?? null
            );
        });
    }
}
