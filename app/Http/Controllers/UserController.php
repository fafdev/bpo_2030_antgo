<?php

namespace App\Http\Controllers;

use App\Concerns\ReadsCsvRows;
use App\Http\Requests\ImportUserCsvRequest;
use App\Http\Requests\StoreUserManagementRequest;
use App\Http\Requests\UpdateUserManagementRequest;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use ReadsCsvRows;

    public function index(): Response
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        return Inertia::render('users/index', [
            'users' => User::query()
                ->with('rol:id,code,name')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'rol_id']),
            'roles' => Rol::query()
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreUserManagementRequest $request): RedirectResponse
    {
        User::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Usuari creat correctament.'),
        ]);

        return to_route('users.index');
    }

    public function update(UpdateUserManagementRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (($validated['password'] ?? '') === '') {
            unset($validated['password']);
        }

        $user->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Usuari actualitzat correctament.'),
        ]);

        return to_route('users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        if (request()->user()?->is($user)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No pots eliminar el teu propi usuari.'),
            ]);

            return to_route('users.index');
        }

        $user->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Usuari eliminat correctament.'),
        ]);

        return to_route('users.index');
    }

    public function import(ImportUserCsvRequest $request): RedirectResponse
    {
        $rows = $this->readCsvRows($request->file('file'), ['name', 'email']);
        $rolesByCode = Rol::query()->get(['id', 'code'])->keyBy('code');
        $importedRows = 0;

        foreach ($rows as $row) {
            $name = $row['name'] ?? '';
            $email = $row['email'] ?? '';

            if ($name === '' || $email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            $payload = [
                'name' => $name,
                'rol_id' => null,
            ];

            $rolCode = $row['rol_code'] ?? '';

            if ($rolCode !== '' && $rolesByCode->has($rolCode)) {
                $payload['rol_id'] = $rolesByCode[$rolCode]->id;
            }

            $password = $row['password'] ?? '';

            if ($password !== '') {
                $payload['password'] = $password;
            }

            User::query()->updateOrCreate(
                ['email' => $email],
                $payload,
            );

            $importedRows++;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Importacio d\'usuaris completada: :count files.', ['count' => $importedRows]),
        ]);

        return to_route('users.index');
    }
}
