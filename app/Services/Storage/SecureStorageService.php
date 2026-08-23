<?php

namespace App\Services\Storage;

use App\Models\User;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SecureStorageService
{
    public function storePublic(UploadedFile $file, string $folder = 'public_media'): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs($folder, $filename, 'public');
    }

    public function getPublicUrl(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    public function storePrivate(UploadedFile $file, string $folder = 'documents', ?int $gymId = null): string
    {
        $resolvedGymId = $gymId ?? app(GymContext::class)->getGymId() ?? 'system';
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $targetPath = "tenants/{$resolvedGymId}/{$folder}";

        return $file->storeAs($targetPath, $filename, 'local');
    }

    public function getPrivate(string $path): ?string
    {
        if (!Storage::disk('local')->exists($path)) {
            return null;
        }

        return Storage::disk('local')->get($path);
    }

    public function canUserAccessPrivateFile(?User $user, string $path): bool
    {
        if (!$user) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if file belongs to user's gym
        if (preg_match('/^tenants\/(\d+)\//', $path, $matches)) {
            $fileGymId = (int) $matches[1];
            return (int) $user->gym_id === $fileGymId;
        }

        return false;
    }
}
