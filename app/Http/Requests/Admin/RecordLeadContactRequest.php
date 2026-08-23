<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RecordLeadContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lead = $this->route('lead');

        return $lead ? ($this->user()?->can('contact', $lead) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:call,whatsapp,visit,email,note'],
            'note' => ['required', 'string', 'max:2000'],
            'contacted_at' => ['nullable', 'date'],
            'next_follow_up_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Jenis aktivitas kontak wajib dipilih.',
            'note.required' => 'Catatan follow-up wajib diisi.',
        ];
    }
}
