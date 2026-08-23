<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ChangeLeadStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lead = $this->route('lead');

        return $lead ? ($this->user()?->can('update', $lead) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:new,contacted,qualified,interested,not_interested,lost'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
