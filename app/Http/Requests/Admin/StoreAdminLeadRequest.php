<?php

namespace App\Http\Requests\Admin;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdminLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Lead::class) ?? false;
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
            'assigned_to' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap prospek wajib diisi.',
            'phone.required' => 'Nomor WhatsApp / HP prospek wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'source.required' => 'Sumber prospek wajib dipilih.',
        ];
    }
}
