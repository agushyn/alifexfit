<?php

namespace App\Http\Requests\Admin;

use App\Models\WebsiteSection;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageSection', WebsiteSection::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
