<?php

namespace App\Http\Requests\Admin;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $member = $this->route('member');
        return $this->user()?->can('update', $member) ?? false;
    }

    public function rules(): array
    {
        /** @var Member $member */
        $member = $this->route('member');
        $gymId = $member?->gym_id;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('members', 'email')
                    ->where(fn ($q) => $q->where('gym_id', $gymId)->whereNull('deleted_at'))
                    ->ignore($member?->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact' => ['nullable', 'array'],
            'emergency_contact.name' => ['nullable', 'string', 'max:100'],
            'emergency_contact.phone' => ['nullable', 'string', 'max:50'],
            'emergency_contact.relationship' => ['nullable', 'string', 'max:50'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'status' => ['required', 'in:active,inactive,suspended,expired'],
        ];
    }
}