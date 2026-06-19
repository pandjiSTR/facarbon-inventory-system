<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\ProductImport;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    /**
     * POST /api/import/preview
     *
     * Upload file Excel, parse & validasi tiap baris,
     * kembalikan preview data + status validasi tanpa menyimpan ke DB.
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:5120', // max 5MB
        ], [
            'file.required' => 'File Excel wajib diupload.',
            'file.mimes'    => 'File harus berformat .xlsx atau .xls.',
            'file.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        try {
            $import = new ProductImport();
            Excel::import($import, $request->file('file'));

            $rows = $import->getRows();

            if (empty($rows)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File Excel kosong atau format header tidak sesuai.',
                    'hint'    => 'Pastikan header baris 1 adalah: SKU | Nama Produk | Carbon Type | Kompatibilitas Vespa | Harga Modal | Harga Reseller | Harga Online',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Preview berhasil. Periksa data sebelum konfirmasi import.',
                'data'    => [
                    'total_rows'   => count($rows),
                    'valid_rows'   => $import->getValidCount(),
                    'invalid_rows' => $import->getInvalidCount(),
                    'rows'         => $rows,
                ],
            ]);

        } catch (\Maatwebsite\Excel\Exceptions\UnreadableFileException $e) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak bisa dibaca. Pastikan file tidak corrupt.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/import/confirm
     *
     * Terima array produk valid dari frontend (hasil preview yang sudah dikoreksi),
     * insert semua ke DB dalam satu transaction.
     *
     * Body: { "products": [ { sku, name, carbon_type, vespa_compatibility, modal_price, reseller_price, online_price }, ... ] }
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'products'                          => 'required|array|min:1',
            'products.*.sku'                    => 'required|string|max:20|distinct|unique:products,sku',
            'products.*.name'                   => 'required|string|max:255',
            'products.*.carbon_type'            => 'required|in:twill,forged,plain',
            'products.*.vespa_compatibility'    => 'required|array|min:1',
            'products.*.vespa_compatibility.*'  => 'required|string',
            'products.*.modal_price'            => 'required|integer|min:0',
            'products.*.reseller_price'         => 'required|integer|min:0',
            'products.*.online_price'           => 'nullable|integer|min:0',
        ], [
            'products.*.sku.unique'    => 'SKU :input sudah terdaftar di database.',
            'products.*.sku.distinct'  => 'SKU :input duplikat dalam data yang dikirim.',
            'products.*.carbon_type.in' => 'Carbon type harus salah satu dari: twill, forged, plain.',
        ]);

        $products    = $request->input('products');
        $imported    = 0;
        $failed      = [];

        DB::beginTransaction();
        try {
            foreach ($products as $index => $item) {
                // vespa_compatibility disimpan sebagai string (join dengan koma)
                // sesuai schema kolom VARCHAR di tabel products
                $vespaValue = is_array($item['vespa_compatibility'])
                    ? implode(', ', $item['vespa_compatibility'])
                    : $item['vespa_compatibility'];

                Product::create([
                    'sku'                 => strtoupper(trim($item['sku'])),
                    'name'                => trim($item['name']),
                    'carbon_type'         => $item['carbon_type'],
                    'vespa_compatibility' => $vespaValue,
                    'modal_price'         => $item['modal_price'],
                    'reseller_price'      => $item['reseller_price'],
                    'online_price'        => $item['online_price'] ?? null,
                    'current_stock'       => 0,
                    'is_active'           => true,
                ]);

                $imported++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$imported} produk berhasil diimport.",
                'data'    => [
                    'imported' => $imported,
                    'failed'   => count($failed),
                    'errors'   => $failed,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Import gagal, semua data dibatalkan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
