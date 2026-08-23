<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'membership_plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:100'],
            'ktp' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // 5MB max
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'membership_plan_id.required' => 'Silakan pilih paket membership.',
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'phone.required' => 'Nomor WhatsApp / Telepon wajib diisi.',
            'address.required' => 'Alamat domisili wajib diisi.',
            'ktp.required' => 'Foto atau dokumen KTP wajib diunggah.',
            'ktp.file' => 'File KTP tidak valid.',
            'ktp.mimes' => 'Format KTP harus berformat JPG, JPEG, PNG, atau PDF.',
            'ktp.max' => 'Ukuran file KTP maksimal 5 MB.',
        ];
    }
}
