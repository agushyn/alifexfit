<?php

namespace App\Services\Website;

use App\Models\WebsiteHero;
use App\Services\Audit\AuditService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class WebsiteHeroService
{
    public function __construct(
        protected AuditService $auditService,
        protected GymContext $gymContext
    ) {}

    /**
     * Create a new website hero slide.
     *
     * @throws ValidationException
     */
    public function createHero(
        array $data,
        ?UploadedFile $media = null,
        ?UploadedFile $poster = null,
        ?int $gymId = null
    ): WebsiteHero {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId() ?? auth()->user()?->gym_id;

        if (! $effectiveGymId) {
            throw ValidationException::withMessages([
                'gym_id' => 'Gym context tidak teridentifikasi.',
            ]);
        }

        return DB::transaction(function () use ($data, $media, $poster, $effectiveGymId) {
            $mediaPath = null;
            $posterPath = null;

            if ($media) {
                $subFolder = ($data['media_type'] ?? 'image') === 'video' ? 'videos' : 'images';
                $mediaPath = $media->store("gyms/{$effectiveGymId}/heroes/{$subFolder}", 'public');
            } elseif (! empty($data['media_path'])) {
                $mediaPath = $data['media_path'];
            }

            if ($poster) {
                $posterPath = $poster->store("gyms/{$effectiveGymId}/heroes/posters", 'public');
            } elseif (! empty($data['poster_path'])) {
                $posterPath = $data['poster_path'];
            }

            $hero = WebsiteHero::create([
                'gym_id' => $effectiveGymId,
                'title' => trim($data['title']),
                'subtitle' => isset($data['subtitle']) && $data['subtitle'] ? trim($data['subtitle']) : null,
                'description' => isset($data['description']) && $data['description'] ? trim($data['description']) : null,
                'cta_label' => isset($data['cta_label']) && $data['cta_label'] ? trim($data['cta_label']) : null,
                'cta_url' => isset($data['cta_url']) && $data['cta_url'] ? trim($data['cta_url']) : null,
                'media_type' => $data['media_type'] ?? 'image',
                'media_path' => $mediaPath,
                'poster_path' => $posterPath,
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ]);

            $this->auditService->log(
                action: 'website_hero.created',
                entityType: WebsiteHero::class,
                entityId: $hero->id,
                metadata: [
                    'gym_id' => $effectiveGymId,
                    'title' => $hero->title,
                    'media_type' => $hero->media_type,
                    'is_active' => $hero->is_active,
                ],
                gymId: $effectiveGymId
            );

            return $hero;
        });
    }

    /**
     * Update an existing website hero slide.
     */
    public function updateHero(
        WebsiteHero $hero,
        array $data,
        ?UploadedFile $media = null,
        ?UploadedFile $poster = null
    ): WebsiteHero {
        return DB::transaction(function () use ($hero, $data, $media, $poster) {
            $effectiveGymId = $hero->gym_id;

            if ($media) {
                if ($hero->media_path && Storage::disk('public')->exists($hero->media_path)) {
                    Storage::disk('public')->delete($hero->media_path);
                }
                $subFolder = ($data['media_type'] ?? $hero->media_type) === 'video' ? 'videos' : 'images';
                $hero->media_path = $media->store("gyms/{$effectiveGymId}/heroes/{$subFolder}", 'public');
            }

            if ($poster) {
                if ($hero->poster_path && Storage::disk('public')->exists($hero->poster_path)) {
                    Storage::disk('public')->delete($hero->poster_path);
                }
                $hero->poster_path = $poster->store("gyms/{$effectiveGymId}/heroes/posters", 'public');
            }

            $hero->fill([
                'title' => isset($data['title']) ? trim($data['title']) : $hero->title,
                'subtitle' => array_key_exists('subtitle', $data) ? ($data['subtitle'] ? trim($data['subtitle']) : null) : $hero->subtitle,
                'description' => array_key_exists('description', $data) ? ($data['description'] ? trim($data['description']) : null) : $hero->description,
                'cta_label' => array_key_exists('cta_label', $data) ? ($data['cta_label'] ? trim($data['cta_label']) : null) : $hero->cta_label,
                'cta_url' => array_key_exists('cta_url', $data) ? ($data['cta_url'] ? trim($data['cta_url']) : null) : $hero->cta_url,
                'media_type' => $data['media_type'] ?? $hero->media_type,
                'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $hero->sort_order,
                'is_active' => array_key_exists('is_active', $data) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : $hero->is_active,
            ]);

            $hero->save();

            $this->auditService->log(
                action: 'website_hero.updated',
                entityType: WebsiteHero::class,
                entityId: $hero->id,
                metadata: [
                    'gym_id' => $hero->gym_id,
                    'title' => $hero->title,
                    'media_type' => $hero->media_type,
                    'is_active' => $hero->is_active,
                ],
                gymId: $hero->gym_id
            );

            return $hero;
        });
    }

    /**
     * Toggle hero active status.
     */
    public function toggleStatus(WebsiteHero $hero): WebsiteHero
    {
        $hero->is_active = ! $hero->is_active;
        $hero->save();

        $this->auditService->log(
            action: $hero->is_active ? 'website_hero.activated' : 'website_hero.deactivated',
            entityType: WebsiteHero::class,
            entityId: $hero->id,
            metadata: [
                'gym_id' => $hero->gym_id,
                'title' => $hero->title,
                'is_active' => $hero->is_active,
            ],
            gymId: $hero->gym_id
        );

        return $hero;
    }

    /**
     * Reorder heroes.
     */
    public function reorder(array $orderedIds, ?int $gymId = null): void
    {
        $effectiveGymId = $gymId ?? $this->gymContext->getGymId();

        DB::transaction(function () use ($orderedIds, $effectiveGymId) {
            foreach ($orderedIds as $order => $id) {
                WebsiteHero::where('gym_id', $effectiveGymId)
                    ->where('id', $id)
                    ->update(['sort_order' => $order]);
            }

            $this->auditService->log(
                action: 'website_hero.reordered',
                entityType: WebsiteHero::class,
                metadata: [
                    'gym_id' => $effectiveGymId,
                    'ordered_ids' => $orderedIds,
                ],
                gymId: $effectiveGymId
            );
        });
    }

    /**
     * Delete a website hero slide and cleanup stored media.
     */
    public function deleteHero(WebsiteHero $hero): bool
    {
        return DB::transaction(function () use ($hero) {
            $heroId = $hero->id;
            $title = $hero->title;
            $gymId = $hero->gym_id;

            if ($hero->media_path && Storage::disk('public')->exists($hero->media_path)) {
                Storage::disk('public')->delete($hero->media_path);
            }

            if ($hero->poster_path && Storage::disk('public')->exists($hero->poster_path)) {
                Storage::disk('public')->delete($hero->poster_path);
            }

            $deleted = $hero->delete();

            $this->auditService->log(
                action: 'website_hero.deleted',
                entityType: WebsiteHero::class,
                entityId: $heroId,
                metadata: [
                    'gym_id' => $gymId,
                    'title' => $title,
                ],
                gymId: $gymId
            );

            return (bool) $deleted;
        });
    }
}
