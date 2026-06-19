<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductImport implements ToCollection, WithHeadingRow
{
    protected array $rows = [];
    protected int $validCount   = 0;
    protected int $invalidCount = 0;

    /**
     * Mapping header Excel → key internal
     * Header Excel: SKU | Nama Produk | Carbon Type | Kompatibilitas Vespa | Harga Modal | Harga Reseller | Harga Online
     */
    public function collection(Collection $rows): void
    {
        // Ambil semua SKU yang sudah ada di DB untuk cek duplikat
        $existingSkus = Product::pluck('sku')->map(fn($s) => strtoupper($s))->toArray();

        // Track SKU dalam file ini sendiri (cegah duplikat antar baris di Excel)
        $seenSkus = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 karena baris 1 = header

            // Normalize key dari header (maatwebsite otomatis lowercase + underscore)
            $sku                = strtoupper(trim($row['sku'] ?? ''));
            $name               = trim($row['nama_produk'] ?? '');
            $carbonType         = strtolower(trim($row['carbon_type'] ?? ''));
            $vespaRaw           = trim($row['kompatibilitas_vespa'] ?? '');
            $modalPrice         = $this->parsePrice($row['harga_modal'] ?? null);
            $resellerPrice      = $this->parsePrice($row['harga_reseller'] ?? null);
            $onlinePrice        = $this->parsePrice($row['harga_online'] ?? null);

            // Split vespa_compatibility: "Sprint, LX" → ["Sprint", "LX"]
            $vespaCompatibility = $vespaRaw
                ? array_values(array_filter(array_map('trim', explode(',', $vespaRaw))))
                : [];

            $errors = [];

            // ── Validasi ──────────────────────────────────────────────────────

            if (empty($sku)) {
                $errors[] = 'SKU wajib diisi';
            } else {
                if (in_array($sku, $existingSkus)) {
                    $errors[] = 'SKU sudah terdaftar di database';
                }
                if (in_array($sku, $seenSkus)) {
                    $errors[] = 'SKU duplikat dalam file Excel';
                }
            }

            if (empty($name)) {
                $errors[] = 'Nama produk wajib diisi';
            }

            if (empty($carbonType)) {
                $errors[] = 'Carbon type wajib diisi';
            } elseif (!in_array($carbonType, ['twill', 'forged', 'plain'])) {
                $errors[] = 'Carbon type harus salah satu dari: twill, forged, plain';
            }

            if (empty($vespaCompatibility)) {
                $errors[] = 'Kompatibilitas Vespa wajib diisi';
            }

            if ($modalPrice === null) {
                $errors[] = 'Harga modal wajib diisi dan harus berupa angka';
            } elseif ($modalPrice < 0) {
                $errors[] = 'Harga modal tidak boleh negatif';
            }

            if ($resellerPrice === null) {
                $errors[] = 'Harga reseller wajib diisi dan harus berupa angka';
            } elseif ($resellerPrice < 0) {
                $errors[] = 'Harga reseller tidak boleh negatif';
            }

            if ($onlinePrice !== null && $onlinePrice < 0) {
                $errors[] = 'Harga online tidak boleh negatif';
            }

            $isValid = empty($errors);

            if ($isValid) {
                $this->validCount++;
                $seenSkus[] = $sku;
            } else {
                $this->invalidCount++;
            }

            $this->rows[] = [
                'row_number'          => $rowNumber,
                'sku'                 => $sku,
                'name'                => $name,
                'carbon_type'         => $carbonType,
                'vespa_compatibility' => $vespaCompatibility,
                'modal_price'         => $modalPrice,
                'reseller_price'      => $resellerPrice,
                'online_price'        => $onlinePrice,
                'is_valid'            => $isValid,
                'errors'              => $errors,
            ];
        }
    }

    /**
     * Parse harga: bisa berupa integer, float, atau string dengan titik/koma
     */
    private function parsePrice(mixed $value): ?int
    {
        if ($value === null || $value === '') return null;

        // Hapus karakter non-numerik kecuali titik dan koma
        $cleaned = preg_replace('/[^\d.,]/', '', (string) $value);
        // Hapus titik sebagai pemisah ribuan, ganti koma jadi titik desimal
        $cleaned = str_replace(['.', ','], ['', '.'], $cleaned);

        return is_numeric($cleaned) ? (int) round((float) $cleaned) : null;
    }

    public function getRows(): array        { return $this->rows; }
    public function getValidCount(): int    { return $this->validCount; }
    public function getInvalidCount(): int  { return $this->invalidCount; }
}
