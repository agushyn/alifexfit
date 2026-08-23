<?php

namespace App\Http\Requests\Admin;

use App\Models\Membership;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        $membership = $this->route('membership');
        return $this->user()?->can('update', $membership) ?? false;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'in:pending,active,expired,suspended,cancelled'],
            'payment_status' => ['sometimes', 'required', 'in:pending,paid,failed,refunded,expired'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}