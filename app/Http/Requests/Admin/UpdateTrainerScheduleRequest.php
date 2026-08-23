<?php

namespace App\Http\Requests\Admin;

use App\Models\TrainerSchedule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTrainerScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $schedule = $this->route('schedule');
        if (is_numeric($schedule)) {
            $schedule = TrainerSchedule::withoutGymScope()->find($schedule);
        }
        $trainer = $schedule?->trainer;

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
