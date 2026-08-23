<?php

namespace App\Http\Requests;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;

class StorePublicLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'source_detail' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp / Telepon wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'message.max' => 'Pesan tidak boleh melebihi 1000 karakter.',
        ];
    }
}
