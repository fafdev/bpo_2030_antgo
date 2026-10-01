<?php

namespace App\Http\Requests;

use App\Rules\SpanishTaxId as SpanishTaxIdRule;
use App\Support\SpanishTaxId as SpanishTaxIdSupport;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessPartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->rol?->code === 'admin';
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['prohibited'],
            'tax_id' => ['nullable', 'string', 'max:50', 'unique:business_partners,tax_id', new SpanishTaxIdRule],
            'type' => ['required', 'in:person,company'],
            'company_name' => ['required_if:type,company', 'prohibited_if:type,person', 'nullable', 'string', 'max:255'],
            'first_name' => ['required_if:type,person', 'prohibited_if:type,company', 'nullable', 'string', 'max:255'],
            'middle_name' => ['nullable', 'prohibited_if:type,company', 'string', 'max:255'],
            'last_name' => ['required_if:type,person', 'prohibited_if:type,company', 'nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255', 'unique:business_partners,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'addresses' => ['nullable', 'array'],
            'addresses.*.address_type' => ['required', 'string', 'max:50'],
            'addresses.*.line_1' => ['required', 'string', 'max:255'],
            'addresses.*.line_2' => ['nullable', 'string', 'max:255'],
            'addresses.*.city' => ['required', 'string', 'max:255'],
            'addresses.*.state' => ['nullable', 'string', 'max:255'],
            'addresses.*.postal_code' => ['nullable', 'string', 'max:50'],
            'addresses.*.country_code' => ['required', 'string', 'size:2'],
            'addresses.*.is_primary' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $taxId = SpanishTaxIdSupport::normalize($this->input('tax_id'));
        $detectedType = SpanishTaxIdSupport::detectType($taxId);

        $this->merge([
            'tax_id' => $taxId,
            'type' => $detectedType ?? 'person',
        ]);
    }
}
