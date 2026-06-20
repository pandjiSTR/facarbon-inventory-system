<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class FinanceImport implements ToCollection, WithHeadingRow
{
    protected array $rows = [];

    public function collection(Collection $rows): void
    {
        $lastDate = null;

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            $rawDate = trim($row['tanggal'] ?? '');
            if (!empty($rawDate)) {
                try {
                    if (is_numeric($rawDate)) {
                        $lastDate = Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($rawDate))->format('Y-m-d');
                    } else {
                        $parsed = null;
                        $formats = ['d/m/Y', 'd-m-Y', 'Y-m-d', 'd/m/y', 'j/n/Y', 'j/n/y'];
                        foreach ($formats as $fmt) {
                            try {
                                $parsed = Carbon::createFromFormat($fmt, $rawDate);
                                if ($parsed) break;
                            } catch (\Exception $e) {}
                        }
                        if ($parsed) {
                            $lastDate = $parsed->format('Y-m-d');
                        }
                    }
                } catch (\Exception $e) {}
            }
            $date = $lastDate;

            $description = trim($row['keterangan'] ?? '');
            $debit       = $this->parseAmount($row['debit'] ?? null);
            $kredit      = $this->parseAmount($row['kredit'] ?? null);

            if (empty($description) && $debit === null && $kredit === null) continue;
            if ($date === null) continue;

            if ($debit !== null && $debit > 0) {
                $type   = 'debit';
                $amount = $debit;
            } elseif ($kredit !== null && $kredit > 0) {
                $type   = 'kredit';
                $amount = $kredit;
            } else {
                continue;
            }

            $this->rows[] = [
                'row_number'  => $rowNumber,
                'date'        => $date,
                'description' => $description ?: '-',
                'type'        => $type,
                'amount'      => $amount,
                'category'    => 'lain_lain',
            ];
        }
    }

    private function parseAmount(mixed $value): ?int
    {
        if ($value === null || $value === '' || $value === '-') return null;
        $cleaned = preg_replace('/[^\d.,]/', '', (string) $value);
        $cleaned = str_replace('.', '', $cleaned);
        $cleaned = str_replace(',', '.', $cleaned);
        return is_numeric($cleaned) ? (int) round((float) $cleaned) : null;
    }

    public function getRows(): array { return $this->rows; }
}