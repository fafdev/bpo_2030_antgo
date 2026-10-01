<?php

namespace App\Models;

use Database\Factories\PostalcodeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'city'])]
class Postalcode extends Model
{
    /** @use HasFactory<PostalcodeFactory> */
    use HasFactory, HasUlids;

    public function addresses(): HasMany
    {
        return $this->hasMany(BusinessPartnerAddress::class, 'postal_code', 'code');
    }
}
