<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreWebsiteHeroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'cta_url' => ['nullable', 'string', 'max:255'],
            'media_type' => ['required', 'in:image,video'],
            'media' => [
                'nullable',
                'file',
                function ($attribute, $value, $fail) {
                    $mediaType = $this->input('media_type', 'image');
                    if ($mediaType === 'video') {
                        $allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
                        if (! in_array($value->getMimeType(), $allowedMimes)) {
                            $fail('Video harus berformat MP4 atau WebM.');
                        }
                        if ($value->getSize() > 51200 * 1024) { // 50MB
                            $fail('Ukuran file video tidak boleh melebihi 50MB.');
                        }
                    } else {
                        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                        if (! in_array($value->getMimeType(), $allowedMimes)) {
                            $fail('Gambar harus berformat JPG, JPEG, PNG, atau WEBP.');
                        }
                        if ($value->getSize() > 10240 * 1024) { // 10MB
                            $fail('Ukuran file gambar tidak boleh melebihi 10MB.');
                        }
                    }
                },
            ],
            'poster' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,webp',
                'max:10240',
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul Hero wajib diisi.',
            'media_type.required' => 'Tipe media wajib dipilih.',
            'media_type.in' => 'Tipe media harus berupa Image atau Video.',
            'poster.mimes' => 'Gambar poster/fallback harus berformat JPG, PNG, atau WEBP.',
            'poster.max' => 'Ukuran poster tidak boleh melebihi 10MB.',
        ];
    }
}
