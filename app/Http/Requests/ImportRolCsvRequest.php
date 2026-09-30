<?php

namespace App\Http\Requests;

use App\Models\Rol;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportRolCsvRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Rol::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ];
    }
}
