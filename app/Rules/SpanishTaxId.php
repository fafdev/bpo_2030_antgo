<?php

namespace App\Rules;

use App\Support\SpanishTaxId as SpanishTaxIdSupport;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class SpanishTaxId implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! SpanishTaxIdSupport::isValid($value)) {
            $fail(__('El :attribute debe ser un NIF, NIE o CIF válido.'));
        }
    }
}
