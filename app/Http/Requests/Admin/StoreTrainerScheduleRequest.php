<?php

namespace App\Http\Requests\Admin;

use App\Models\Trainer;
use Illuminate\Foundation\Http\FormRequest;

class StoreTrainerScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $trainer = $this->route('trainer');
        if (is_numeric($trainer)) {
            $trainer = Trainer::withoutGymScope()->find($trainer);
        }
        if (! $trainer && $this->input('trainer_id')) {
            $trainer = Trainer::withoutGymScope()->find($this->input('trainer_id'));
        }

        return $trainer && ($this->user()?->can('manageSchedule', $trainer) ?? false);
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'status' => ['required', 'in:active,inactive'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_time.after' => 'Jam selesai harus lebih akhir dari jam mulai.',
            'day_of_week.between' => 'Hari harus bernilai antara 0 (Minggu) sampai 6 (Sabtu).',
        ];
    }
}
