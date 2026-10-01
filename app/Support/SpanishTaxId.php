<?php

namespace App\Support;

class SpanishTaxId
{
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $value) ?? '');

        return $normalized === '' ? null : $normalized;
    }

    public static function detectType(?string $value): ?string
    {
        $normalized = self::normalize($value);

        if ($normalized === null) {
            return null;
        }

        if (self::isValidCif($normalized)) {
            return 'company';
        }

        if (self::isValidNif($normalized) || self::isValidNie($normalized)) {
            return 'person';
        }

        return null;
    }

    public static function isValid(?string $value): bool
    {
        $normalized = self::normalize($value);

        if ($normalized === null) {
            return false;
        }

        return self::isValidNif($normalized)
            || self::isValidNie($normalized)
            || self::isValidCif($normalized);
    }

    private static function isValidNif(string $value): bool
    {
        if (! preg_match('/^\d{8}[A-Z]$/', $value)) {
            return false;
        }

        $letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        $number = (int) substr($value, 0, 8);
        $expected = $letters[$number % 23];

        return $value[8] === $expected;
    }

    private static function isValidNie(string $value): bool
    {
        if (! preg_match('/^[XYZ]\d{7}[A-Z]$/', $value)) {
            return false;
        }

        $prefixMap = ['X' => '0', 'Y' => '1', 'Z' => '2'];
        $number = $prefixMap[$value[0]].substr($value, 1, 7);
        $letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        $expected = $letters[((int) $number) % 23];

        return $value[8] === $expected;
    }

    private static function isValidCif(string $value): bool
    {
        if (! preg_match('/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/', $value)) {
            return false;
        }

        $control = $value[8];
        $digits = substr($value, 1, 7);
        $sumEven = 0;
        $sumOdd = 0;

        for ($index = 0; $index < 7; $index++) {
            $digit = (int) $digits[$index];

            if ($index % 2 === 0) {
                $double = $digit * 2;
                $sumOdd += intdiv($double, 10) + ($double % 10);
            } else {
                $sumEven += $digit;
            }
        }

        $total = $sumEven + $sumOdd;
        $controlDigit = (10 - ($total % 10)) % 10;
        $controlLetter = 'JABCDEFGHI'[$controlDigit];
        $firstLetter = $value[0];

        if (in_array($firstLetter, ['P', 'Q', 'R', 'S', 'N', 'W'], true)) {
            return $control === $controlLetter;
        }

        if (in_array($firstLetter, ['A', 'B', 'E', 'H'], true)) {
            return $control === (string) $controlDigit;
        }

        return $control === (string) $controlDigit || $control === $controlLetter;
    }
}
