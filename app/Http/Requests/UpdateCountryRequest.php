<?php

namespace App\Http\Requests;

use App\Models\Country;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->rol?->code === 'admin';
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $country = $this->route('country');
        $countryId = $country instanceof Country ? $country->id : null;

        return [
            'code' => [
                'required',
                'string',
                'size:2',
                'alpha',
                Rule::unique('countries', 'code')->ignore($countryId),
            ],
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
