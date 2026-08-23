<?php

namespace App\Http\Requests\Admin;

use App\Models\WorkoutType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkoutTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workoutType = $this->route('workout_type');
        return $this->user()?->can('update', $workoutType) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}