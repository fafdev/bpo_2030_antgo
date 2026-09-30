<?php

namespace App\Http\Requests;

use App\Models\Rol;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $rol = $this->route('rol');

        if (! $rol instanceof Rol) {
            return false;
        }

        return $this->user()?->can('update', $rol) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rolId = $this->route('rol')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rols', 'code')->ignore($rolId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
