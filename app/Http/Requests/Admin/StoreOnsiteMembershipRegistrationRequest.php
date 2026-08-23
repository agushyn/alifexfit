<?php

namespace App\Http\Requests\Admin;

use App\Models\MembershipPlan;
use App\Models\MembershipRegistration;
use App\Services\Tenancy\GymContext;
use Illuminate\Foundation\Http\FormRequest;

class StoreOnsiteMembershipRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', MembershipRegistration::class) ?? false;
    }

    public function rules(GymContext $gymContext): array
    {
        $resolvedGymId = $this->user()->isSuperAdmin()
            ? ($gymContext->getGymId() ?? $this->user()->gym_id)
            : $this->user()->gym_id;

        return [
            'membership_plan_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($resolvedGymId) {
                    $plan = MembershipPlan::withoutGymScope()
                        ->where('gym_id', $resolvedGymId)
                        ->where('id', $value)
                        ->where('status', 'active')
                        ->first();

                    if (! $plan) {
                        $fail('Paket membership yang dipilih tidak valid atau tidak aktif untuk cabang ini.');
                    }
                },
            ],
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:50'],
            'start_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'membership_plan_id.required' => 'Silakan pilih paket membership.',
            'full_name.required' => 'Nama lengkap member wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'phone.required' => 'Nomor WhatsApp / HP wajib diisi.',
            'address.required' => 'Alamat domisili wajib diisi.',
            'photo.image' => 'File foto harus berupa gambar.',
            'photo.mimes' => 'Format foto harus berupa jpeg, png, jpg, atau webp.',
            'photo.max' => 'Ukuran foto maksimal 2MB.',
        ];
    }
}
