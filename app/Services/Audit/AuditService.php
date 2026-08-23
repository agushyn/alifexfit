<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\Tenancy\GymContext;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $metadata = null,
        ?int $gymId = null,
        ?int $userId = null
    ): AuditLog {
        $gymContext = app(GymContext::class);

        $resolvedGymId = $gymId ?? $gymContext->getGymId();
        $resolvedUserId = $userId ?? Auth::id();

        return AuditLog::create([
            'gym_id' => $resolvedGymId,
            'user_id' => $resolvedUserId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }

    public function logLogin(User $user): AuditLog
    {
        return $this->log(
            action: 'auth.login',
            entityType: User::class,
            entityId: $user->id,
            metadata: [
                'email' => $user->email,
                'name' => $user->name,
            ],
            gymId: $user->gym_id,
            userId: $user->id
        );
    }

    public function logLogout(User $user): AuditLog
    {
        return $this->log(
            action: 'auth.logout',
            entityType: User::class,
            entityId: $user->id,
            metadata: [
                'email' => $user->email,
            ],
            gymId: $user->gym_id,
            userId: $user->id
        );
    }
}
