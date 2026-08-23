<?php

namespace App\Http\Requests\Admin;

use App\Models\Trainer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainer = $this->route('trainer');

        return $this->user()?->can('update', $trainer) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'role' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'specialization' => ['nullable', 'string', 'max:100'],
            'certification' => ['nullable', 'string', 'max:255'],
            'hire_date' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:active,inactive'],
            'is_active' => ['nullable', 'boolean'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
