<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Models\Country;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CountryController extends Controller
{
    public function index(): Response
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        return Inertia::render('countries/index', [
            'countries' => Country::query()->orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreCountryRequest $request): RedirectResponse
    {
        Country::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Pais creat correctament.'),
        ]);

        return to_route('countries.index');
    }

    public function update(UpdateCountryRequest $request, Country $country): RedirectResponse
    {
        $country->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Pais actualitzat correctament.'),
        ]);

        return to_route('countries.index');
    }

    public function destroy(Country $country): RedirectResponse
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        if ($country->addresses()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('No es pot eliminar un pais amb adreces associades.'),
            ]);

            return to_route('countries.index');
        }

        $country->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Pais eliminat correctament.'),
        ]);

        return to_route('countries.index');
    }
}
