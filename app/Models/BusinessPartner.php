<?php

namespace App\Models;

use Database\Factories\BusinessPartnerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
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
])]
class BusinessPartner extends Model
{
    /** @use HasFactory<BusinessPartnerFactory> */
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::creating(function (BusinessPartner $businessPartner): void {
            if ($businessPartner->code !== null && $businessPartner->code !== '') {
                return;
            }

            $businessPartner->code = self::nextCode();
        });
    }

    public static function nextCode(): string
    {
        $lastCode = self::query()
            ->where('code', 'like', 'BP-%')
            ->orderByDesc('code')
            ->value('code');

        $nextNumber = 1;

        if (is_string($lastCode) && preg_match('/^BP-(\d{7})$/', $lastCode, $matches) === 1) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return sprintf('BP-%07d', $nextNumber);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(BusinessPartnerAddress::class);
    }
}
