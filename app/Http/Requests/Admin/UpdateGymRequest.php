<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGymRequest extends FormRequest
{
    public function authorize(): bool
    {
        $gym = $this->route('gym');
        return $this->user()?->can('update', $gym) ?? false;
    }

    public function rules(): array
    {
        $gymId = $this->route('gym')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('gyms', 'slug')->ignore($gymId)],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('gyms', 'code')->ignore($gymId)],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'timezone' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
