<?php

namespace App\Http\Requests\Admin;

use App\Models\MembershipPlan;
use App\Services\Tenancy\GymContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMembershipPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', MembershipPlan::class) ?? false;
    }

    public function rules(GymContext $gymContext): array
    {
        $gymId = $this->user()->isSuperAdmin()
            ? ($gymContext->getGymId() ?? $this->user()->gym_id)
            : $this->user()->gym_id;

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