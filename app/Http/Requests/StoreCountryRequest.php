<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->rol?->code === 'admin';
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:2', 'alpha', 'unique:countries,code'],
            'name' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper((string) $this->input('code')),
        ]);
    }
}
