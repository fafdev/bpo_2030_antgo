<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePostalcodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->rol?->code === 'admin';
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:5', 'regex:/^\d{5}$/', 'unique:postalcodes,code'],
            'city' => ['nullable', 'string', 'max:255'],
        ];
    }
}
