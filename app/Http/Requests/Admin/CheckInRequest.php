<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $member = $this->attributes->get('member');
        if ($member && empty($this->input('member_number'))) {
            $this->merge([
                'member_number' => $member->member_number,
                'source' => $this->input('source', 'app'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'member_number' => ['required', 'string', 'max:500'],
            'source' => ['nullable', 'string', 'in:kiosk,app,admin'],
            'device_identifier' => ['nullable', 'string', 'max:100'],
        ];
    }
}