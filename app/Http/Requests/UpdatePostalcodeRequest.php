<?php

namespace App\Http\Requests;

use App\Models\Postalcode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostalcodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->rol?->code === 'admin';
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $postalcode = $this->route('postalcode');
        $postalcodeId = $postalcode instanceof Postalcode ? $postalcode->id : null;

        return [
            'code' => [
                'required',
                'string',
                'size:5',
                'regex:/^\d{5}$/',
                Rule::unique('postalcodes', 'code')->ignore($postalcodeId),
            ],
            'city' => ['nullable', 'string', 'max:255'],
        ];
    }
}
