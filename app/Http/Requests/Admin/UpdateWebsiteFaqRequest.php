<?php

namespace App\Http\Requests\Admin;

use App\Models\WebsiteFaq;
use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteFaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        $faq = $this->route('faq');
        if (is_numeric($faq)) {
            $faq = WebsiteFaq::withoutGymScope()->find($faq);
        }

        return $faq && ($this->user()?->can('manageFaq', $faq) ?? false);
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:255'],
            'answer' => ['required', 'string', 'max:3000'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:published,draft'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
