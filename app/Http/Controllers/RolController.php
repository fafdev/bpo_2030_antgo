<?php

namespace App\Http\Controllers;

use App\Concerns\ReadsCsvRows;
use App\Http\Requests\ImportRolCsvRequest;
use App\Http\Requests\StoreRolRequest;
use App\Http\Requests\UpdateRolRequest;
use App\Models\Rol;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RolController extends Controller
{
    use ReadsCsvRows;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Rol::class);

        return Inertia::render('rols/index', [
            'roles' => Rol::query()
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'description']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(StoreRolRequest $request): RedirectResponse
    {
        Rol::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Rol creat correctament.'),
        ]);

        return to_route('rols.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRolRequest $request, Rol $rol): RedirectResponse
    {
        $rol->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Rol actualitzat correctament.'),
        ]);

        return to_route('rols.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rol $rol): RedirectResponse
    {
        $this->authorize('delete', $rol);

        $rol->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Rol eliminat correctament.'),
        ]);

        return to_route('rols.index');
    }

    public function import(ImportRolCsvRequest $request): RedirectResponse
    {
        $rows = $this->readCsvRows($request->file('file'), ['code', 'name']);
        $importedRows = 0;

        foreach ($rows as $row) {
            $code = $row['code'] ?? '';
            $name = $row['name'] ?? '';

            if ($code === '' || $name === '') {
                continue;
            }

            Rol::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => $row['description'] !== ''
                        ? $row['description']
                        : null,
                ],
            );

            $importedRows++;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Importacio de rols completada: :count files.', ['count' => $importedRows]),
        ]);

        return to_route('rols.index');
    }
}
