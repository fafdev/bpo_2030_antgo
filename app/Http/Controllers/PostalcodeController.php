<?php

namespace App\Http\Controllers;

use App\Concerns\ReadsCsvRows;
use App\Http\Requests\ImportPostalcodeCsvRequest;
use App\Http\Requests\StorePostalcodeRequest;
use App\Http\Requests\UpdatePostalcodeRequest;
use App\Models\Postalcode;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PostalcodeController extends Controller
{
    use ReadsCsvRows;

    public function index(): Response
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        return Inertia::render('postalcodes/index', [
            'postalcodes' => Postalcode::query()->orderBy('code')->get(['id', 'code', 'city']),
        ]);
    }

    public function store(StorePostalcodeRequest $request): RedirectResponse
    {
        Postalcode::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Codi postal creat correctament.'),
        ]);

        return to_route('postalcodes.index');
    }

    public function update(UpdatePostalcodeRequest $request, Postalcode $postalcode): RedirectResponse
    {
        $postalcode->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Codi postal actualitzat correctament.'),
        ]);

        return to_route('postalcodes.index');
    }

    public function destroy(Postalcode $postalcode): RedirectResponse
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        if ($postalcode->addresses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No es pot eliminar un codi postal amb adreces associades.'),
            ]);

            return to_route('postalcodes.index');
        }

        $postalcode->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Codi postal eliminat correctament.'),
        ]);

        return to_route('postalcodes.index');
    }

    public function import(ImportPostalcodeCsvRequest $request): RedirectResponse
    {
        $rows = $this->readCsvRows($request->file('file'), ['code']);
        $importedRows = 0;

        foreach ($rows as $row) {
            $code = $row['code'] ?? '';
            $city = $row['city'] ?? '';

            if (! preg_match('/^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/', $code)) {
                continue;
            }

            Postalcode::query()->updateOrCreate(
                ['code' => $code],
                ['city' => $city !== '' ? $city : null],
            );

            $importedRows++;
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Importacio de codis postals completada: :count files.', ['count' => $importedRows]),
        ]);

        return to_route('postalcodes.index');
    }
}
