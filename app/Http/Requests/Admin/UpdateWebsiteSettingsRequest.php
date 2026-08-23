<?php

namespace App\Http\Requests\Admin;

use App\Models\GymSetting;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', GymSetting::class) || $this->user()?->hasPermissionTo('website.manage') || ($this->user()?->isSuperAdmin() ?? false);
    }

    public function rules(): array
    {
        return [
            'site_title' => ['required', 'string', 'max:150'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'hero_headline' => ['nullable', 'string', 'max:255'],
            'hero_subheadline' => ['nullable', 'string', 'max:500'],
            'hero_cta_text' => ['nullable', 'string', 'max:100'],
            'social_instagram' => ['nullable', 'url', 'max:255'],
            'social_facebook' => ['nullable', 'url', 'max:255'],
            'social_youtube' => ['nullable', 'url', 'max:255'],
            'social_tiktok' => ['nullable', 'url', 'max:255'],
            'contact_whatsapp' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:150'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_address' => ['nullable', 'string', 'max:300'],
            'operating_hours' => ['nullable', 'string', 'max:200'],
            'announcement_bar' => ['nullable', 'string', 'max:255'],
            'google_maps_embed_url' => ['nullable', 'string', 'max:1000'],
            'is_public_visible' => ['required', 'boolean'],
            'og_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ];
    }
}
