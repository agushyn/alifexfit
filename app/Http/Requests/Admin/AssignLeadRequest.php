<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lead = $this->route('lead');

        return $lead ? ($this->user()?->can('assign', $lead) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['nullable', 'integer'],
        ];
    }
}
