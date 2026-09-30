<?php

namespace App\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use SplFileObject;

trait ReadsCsvRows
{
    /**
     * @param  array<int, string>  $requiredHeaders
     * @return array<int, array<string, string>>
     */
    protected function readCsvRows(UploadedFile $file, array $requiredHeaders): array
    {
        $path = $file->getRealPath();

        if ($path === false) {
            throw ValidationException::withMessages([
                'file' => __('No s\'ha pogut llegir el fitxer CSV.'),
            ]);
        }

        $csv = new SplFileObject($path);
        $csv->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY);

        $headerRow = $csv->fgetcsv();

        if (! is_array($headerRow) || $headerRow === [null]) {
            throw ValidationException::withMessages([
                'file' => __('El CSV no te capcalera valida.'),
            ]);
        }

        $headers = array_map(
            fn ($value): string => strtolower(trim((string) $value)),
            $headerRow,
        );

        if (isset($headers[0])) {
            $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF");
        }

        foreach ($requiredHeaders as $requiredHeader) {
            if (! in_array($requiredHeader, $headers, true)) {
                throw ValidationException::withMessages([
                    'file' => __('Falta la columna requerida :column al CSV.', ['column' => $requiredHeader]),
                ]);
            }
        }

        $rows = [];

        while (! $csv->eof()) {
            $row = $csv->fgetcsv();

            if (! is_array($row) || $row === [null]) {
                continue;
            }

            $mappedRow = [];
            $allEmpty = true;

            foreach ($headers as $index => $header) {
                $value = trim((string) ($row[$index] ?? ''));
                $mappedRow[$header] = $value;

                if ($value !== '') {
                    $allEmpty = false;
                }
            }

            if (! $allEmpty) {
                $rows[] = $mappedRow;
            }
        }

        return $rows;
    }
}
