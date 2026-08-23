<?php

namespace App\Http\Requests\Admin;

use App\Models\Membership;
use Illuminate\Foundation\Http\FormRequest;

class StoreMembershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Membership::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'membership_plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'in:pending,active,expired,suspended,cancelled'],
            'payment_status' => ['nullable', 'in:pending,paid,failed,refunded,expired'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}