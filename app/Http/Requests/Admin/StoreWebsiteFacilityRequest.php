<?php

namespace App\Http\Requests\Admin;

use App\Models\WebsiteFacility;
use Illuminate\Foundation\Http\FormRequest;

class StoreWebsiteFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageFacility', WebsiteFacility::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }
}
