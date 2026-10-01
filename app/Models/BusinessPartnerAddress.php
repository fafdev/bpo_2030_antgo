<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'business_partner_id',
    'address_type',
    'line_1',
    'line_2',
    'city',
    'state',
    'postal_code',
    'country_code',
    'is_primary',
])]
class BusinessPartnerAddress extends Model
{
    use HasFactory, HasUuids;

    public function businessPartner(): BelongsTo
    {
        return $this->belongsTo(BusinessPartner::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_code', 'code');
    }

    public function postalcode(): BelongsTo
    {
        return $this->belongsTo(Postalcode::class, 'postal_code', 'code');
    }
}
