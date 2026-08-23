<?php

namespace App\Http\Requests\Admin;

use App\Models\MembershipRegistration;
use Illuminate\Foundation\Http\FormRequest;

class RejectMembershipRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $registration = $this->route('registration');

        return $this->user()?->can('reject', $registration) ?? false;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Alasan penolakan wajib diisi.',
            'rejection_reason.min' => 'Alasan penolakan minimal 3 karakter.',
        ];
    }
}
