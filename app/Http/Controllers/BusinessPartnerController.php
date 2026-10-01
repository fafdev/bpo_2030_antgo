<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBusinessPartnerRequest;
use App\Http\Requests\UpdateBusinessPartnerRequest;
use App\Models\BusinessPartner;
use App\Models\Country;
use App\Models\Postalcode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BusinessPartnerController extends Controller
{
    public function index(): Response
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        return Inertia::render('business-partners/index', [
            'businessPartners' => BusinessPartner::query()
                ->with('addresses:id,business_partner_id,address_type,line_1,line_2,city,state,postal_code,country_code,is_primary')
                ->orderBy('company_name')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get([
                    'id',
                    'code',
                    'tax_id',
                    'type',
                    'company_name',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'birth_date',
                    'email',
                    'phone',
                    'mobile',
                ]),
            'countries' => Country::query()->orderBy('name')->get(['code', 'name']),
            'postalCodeCities' => Postalcode::query()
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->pluck('city', 'code'),
        ]);
    }

    public function store(StoreBusinessPartnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $addresses = $validated['addresses'];
        unset($validated['addresses']);

        DB::transaction(function () use ($validated, $addresses): void {
            $businessPartner = BusinessPartner::query()->create($validated);
            $businessPartner->addresses()->createMany($addresses);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Business Partner creat correctament.'),
        ]);

        return to_route('business-partners.index');
    }

    public function update(UpdateBusinessPartnerRequest $request, BusinessPartner $businessPartner): RedirectResponse
    {
        $validated = $request->validated();
        $addresses = $validated['addresses'];
        unset($validated['addresses']);

        DB::transaction(function () use ($businessPartner, $validated, $addresses): void {
            $businessPartner->update($validated);
            $businessPartner->addresses()->delete();
            $businessPartner->addresses()->createMany($addresses);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Business Partner actualitzat correctament.'),
        ]);

        return to_route('business-partners.index');
    }

    public function destroy(BusinessPartner $businessPartner): RedirectResponse
    {
        abort_unless(request()->user()?->rol?->code === 'admin', 403);

        $businessPartner->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Business Partner eliminat correctament.'),
        ]);

        return to_route('business-partners.index');
    }
}
