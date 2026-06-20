<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StockInImport implements ToCollection, WithHeadingRow
{
    protected array $rows             = [];
    protected array $availableProducts = [];

    /**
     * Header Excel: Tanggal | ITEM | MATERIAL | CARBON TYPE | QTY
     * maatwebsite: tanggal, item, material, carbon_type, qty
     */
    public function collection(Collection $rows): void
    {
        // Load semua produk aktif untuk fuzzy match & available_products
        $products = Product::where('is_active', true)
            ->select('id', 'sku', 'name', 'carbon_type', 'modal_price')
            ->get();

        $this->availableProducts = $products->map(fn($p) => [
            'id'          => $p->id,
            'sku'         => $p->sku,
            'name'        => $p->name,
            'carbon_type' => $p->carbon_type,
            'modal_price' => $p->modal_price,
        ])->toArray();

        $lastDate = null;

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            // ── Forward-fill tanggal ──────────────────────────────────────────
            $rawDate = trim($row['tanggal'] ?? '');
            if (!empty($rawDate)) {
                try {
            if (is_numeric($rawDate)) {
                $lastDate = Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($rawDate))->format('Y-m-d');
            } else {
                $rawDate = trim($rawDate);
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

            $itemName   = trim($row['item'] ?? '');
            $material   = trim($row['material'] ?? '');
            $carbonType = strtolower(trim($row['carbon_type'] ?? ''));
            $qty        = (int) ($row['qty'] ?? 0);

            // Skip baris kosong
            if (empty($itemName) && $qty === 0) continue;
            if ($date === null) continue;

            // ── Fuzzy match ke produk ─────────────────────────────────────────
            $matched = $this->fuzzyMatch($itemName, $carbonType, $products);

            $this->rows[] = [
                'row_number'           => $rowNumber,
                'date'                 => $date,
                'item_name'            => $itemName,
                'material'             => $material,
                'carbon_type'          => $carbonType,
                'quantity'             => $qty,
                'matched_product_id'   => $matched?->id,
                'matched_product_name' => $matched?->name,
                'matched_modal_price'  => $matched?->modal_price,
            ];
        }
    }

    /**
     * Fuzzy match: cek dua arah + filter carbon_type
     */
    private function fuzzyMatch(string $itemName, string $carbonType, Collection $products): ?Product
    {
        if (empty($itemName)) return null;

        $itemLower = strtolower($itemName);

        // Pass 1: match carbon_type + nama dua arah
        $match = $products->first(function ($product) use ($itemLower, $carbonType) {
            $productNameLower = strtolower($product->name);
            $carbonMatch = empty($carbonType) || $product->carbon_type === $carbonType;
            $nameMatch   = Str::contains($productNameLower, $itemLower)
                        || Str::contains($itemLower, $productNameLower);
            return $carbonMatch && $nameMatch;
        });

        if ($match) return $match;

        // Pass 2: partial word match (tiap kata di itemName dicek)
        $words = array_filter(explode(' ', $itemLower), fn($w) => strlen($w) > 3);
        foreach ($words as $word) {
            $match = $products->first(function ($product) use ($word, $carbonType) {
                $productNameLower = strtolower($product->name);
                $carbonMatch = empty($carbonType) || $product->carbon_type === $carbonType;
                return $carbonMatch && Str::contains($productNameLower, $word);
            });
            if ($match) return $match;
        }

        return null;
    }

    public function getRows(): array              { return $this->rows; }
    public function getAvailableProducts(): array { return $this->availableProducts; }
}
