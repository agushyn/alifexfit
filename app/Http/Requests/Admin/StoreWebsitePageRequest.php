<?php

namespace App\Http\Requests\Admin;

use App\Models\WebsitePage;
use Illuminate\Foundation\Http\FormRequest;

class StoreWebsitePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('createPage', WebsitePage::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:150'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'og_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ];
    }
}
