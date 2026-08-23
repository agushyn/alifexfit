<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lead = $this->route('lead');

        return $lead ? ($this->user()?->can('update', $lead) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'membership_plan_id' => ['nullable', 'integer'],
            'interest_type' => ['nullable', 'string', 'in:membership,trial,personal_training,workout,general_inquiry,other'],
            'message' => ['nullable', 'string', 'max:1000'],
            'source' => ['required', 'string', 'in:website,whatsapp,walk_in,instagram,facebook,referral,other'],
            'source_detail' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
