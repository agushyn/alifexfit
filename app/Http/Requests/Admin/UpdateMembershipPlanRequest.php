<?php

namespace App\Http\Requests\Admin;

use App\Models\MembershipPlan;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $plan = $this->route('membership_plan');
        return $this->user()?->can('update', $plan) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_period' => ['required', 'in:monthly,quarterly,yearly,custom'],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'joining_fee' => ['nullable', 'numeric', 'min:0'],
            'trainer_quota' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:255'],
            'status' => ['required', 'in:active,inactive'],
            'featured' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}