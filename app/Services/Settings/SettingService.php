<?php

namespace App\Services\Settings;

use App\Models\GymSetting;
use App\Services\Tenancy\GymContext;

class SettingService
{
    public function get(string $key, mixed $default = null, ?int $gymId = null, string $group = 'general'): mixed
    {
        $resolvedGymId = $gymId ?? app(GymContext::class)->getGymId();

        $setting = GymSetting::where('gym_id', $resolvedGymId)
            ->where('group', $group)
            ->where('key', $key)
            ->first();

        if (!$setting && $resolvedGymId !== null) {
            // Fallback to system-level setting
            $setting = GymSetting::whereNull('gym_id')
                ->where('group', $group)
                ->where('key', $key)
                ->first();
        }

        if (!$setting) {
            return $default;
        }

        $decoded = json_decode($setting->value, true);
        return (json_last_error() === JSON_ERROR_NONE && !is_numeric($setting->value)) ? $decoded : $setting->value;
    }

    public function set(string $key, mixed $value, string $group = 'general', ?int $gymId = null): GymSetting
    {
        $resolvedGymId = $gymId ?? app(GymContext::class)->getGymId();

        $encodedValue = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

        return GymSetting::updateOrCreate(
            [
                'gym_id' => $resolvedGymId,
                'group' => $group,
                'key' => $key,
            ],
            [
                'value' => $encodedValue,
            ]
        );
    }

    public function all(?int $gymId = null, ?string $group = null): array
    {
        $resolvedGymId = $gymId ?? app(GymContext::class)->getGymId();

        $query = GymSetting::where('gym_id', $resolvedGymId);

        if ($group !== null) {
            $query->where('group', $group);
        }

        return $query->get()->mapWithKeys(function ($item) {
            $decoded = json_decode($item->value, true);
            $val = (json_last_error() === JSON_ERROR_NONE && !is_numeric($item->value)) ? $decoded : $item->value;
            return [$item->key => $val];
        })->toArray();
    }
}
