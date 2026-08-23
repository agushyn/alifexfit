<?php

namespace App\Http\Requests\Admin;

use App\Models\MembershipRegistration;
use Illuminate\Foundation\Http\FormRequest;

class ApproveMembershipRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $registration = $this->route('registration');

        return $this->user()?->can('approve', $registration) ?? false;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'payment_status' => ['nullable', 'in:paid,pending,failed,refunded'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
