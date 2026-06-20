<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\FinanceImport;
use App\Imports\StockInImport;
use App\Imports\StockOutImport;
use App\Models\Finance;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    // ══════════════════════════════════════════════════════════════════════════
    // IMPORT KEUANGAN
    // ══════════════════════════════════════════════════════════════════════════

    public function financePreview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:5120',
        ]);

        \Log::info('File received:', [
            'name' => $request->file('file')->getClientOriginalName(),
            'size' => $request->file('file')->getSize(),
            'mime' => $request->file('file')->getMimeType(),
        ]);

        try {
            $import = new FinanceImport();
            Excel::import($import, $request->file('file'));

            \Log::info('Rows parsed: ' . count($import->getRows()));

            $rows = $import->getRows();

            if (empty($rows)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File kosong atau format header tidak sesuai.',
                    'hint'    => 'Header harus: Tanggal | Keterangan | Debit | Kredit',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'data'    => ['total_rows' => count($rows), 'rows' => $rows],
            ]);
        } catch (\Exception $e) {
            \Log::error('Finance preview error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal memproses file: ' . $e->getMessage()], 500);
        }
    }

    public function financeConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'records'               => 'required|array|min:1',
            'records.*.date'        => 'required|date',
            'records.*.description' => 'required|string',
            'records.*.type'        => 'required|in:debit,kredit',
            'records.*.category'    => 'required|in:pembelian_stok,produksi,penjualan,operasional,lain_lain',
            'records.*.amount'      => 'required|integer|min:1',
        ]);

        $imported = 0;
        DB::beginTransaction();
        try {
            foreach ($request->input('records') as $record) {
                Finance::create([
                    'user_id'     => $request->user()->id,
                    'date'        => $record['date'],
                    'description' => $record['description'],
                    'type'        => $record['type'],
                    'category'    => $record['category'],
                    'amount'      => $record['amount'],
                    'notes'       => $record['notes'] ?? 'Import historis',
                ]);
                $imported++;
            }
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Import keuangan berhasil. {$imported} catatan ditambahkan.",
                'data'    => ['imported' => $imported, 'failed' => 0, 'errors' => []],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Import gagal: ' . $e->getMessage()], 500);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // IMPORT BARANG MASUK
    // ══════════════════════════════════════════════════════════════════════════

    public function stockInPreview(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls|max:5120']);

        try {
            $import = new StockInImport();
            Excel::import($import, $request->file('file'));
            $rows = $import->getRows();

            if (empty($rows)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File kosong atau format header tidak sesuai.',
                    'hint'    => 'Header harus: Tanggal | ITEM | MATERIAL | CARBON TYPE | QTY',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_rows'         => count($rows),
                    'rows'               => $rows,
                    'available_products' => $import->getAvailableProducts(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memproses file: ' . $e->getMessage()], 500);
        }
    }

    public function stockInConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'records'               => 'required|array|min:1',
            'records.*.product_id'  => 'required|exists:products,id',
            'records.*.quantity'    => 'required|integer|min:1',
            'records.*.modal_price' => 'required|integer|min:0',
            'records.*.date'        => 'required|date',
            'records.*.category'    => 'required|in:pembelian_stok,produksi',
        ]);

        $imported = 0;
        DB::beginTransaction();
        try {
            foreach ($request->input('records') as $record) {
                $product = Product::findOrFail($record['product_id']);

                $stockIn = StockIn::create([
                    'product_id'  => $product->id,
                    'user_id'     => $request->user()->id,
                    'quantity'    => $record['quantity'],
                    'modal_price' => $record['modal_price'],
                    'category'    => $record['category'],
                    'date'        => $record['date'],
                    'notes'       => $record['notes'] ?? 'Import historis',
                ]);

                $product->recalculateStock();

                Finance::create([
                    'user_id'     => $request->user()->id,
                    'stock_in_id' => $stockIn->id,
                    'date'        => $record['date'],
                    'description' => "Import historis: {$product->name} ({$product->sku}) x{$record['quantity']}",
                    'category'    => $record['category'],
                    'type'        => 'debit',
                    'amount'      => $record['quantity'] * $record['modal_price'],
                    'notes'       => 'Import historis',
                ]);

                $imported++;
            }
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Import barang masuk berhasil. {$imported} dicatat.",
                'data'    => ['imported' => $imported, 'failed' => 0, 'errors' => []],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Import gagal: ' . $e->getMessage()], 500);
        }
    }



    // ══════════════════════════════════════════════════════════════════════════
    // IMPORT BARANG KELUAR
    // ══════════════════════════════════════════════════════════════════════════

    public function stockOutPreview(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,xls|max:5120']);

        try {
            $import = new StockOutImport();
            Excel::import($import, $request->file('file'));
            $rows = $import->getRows();

            if (empty($rows)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File kosong atau format header tidak sesuai.',
                    'hint'    => 'Header harus: Tanggal | Item | Material | Carbon Type | QTY',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_rows'         => count($rows),
                    'rows'               => $rows,
                    'available_products' => $import->getAvailableProducts(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memproses file: ' . $e->getMessage()], 500);
        }
    }

    public function stockOutConfirm(Request $request): JsonResponse
    {
        $request->validate([
            'records'              => 'required|array|min:1',
            'records.*.product_id' => 'required|exists:products,id',
            'records.*.quantity'   => 'required|integer|min:1',
            'records.*.sell_price' => 'required|integer|min:0',
            'records.*.channel'    => 'required|in:reseller,online,langsung',
            'records.*.date'       => 'required|date',
        ]);

        $imported = 0;
        $failed   = 0;
        $errors   = [];

        // Per-record transaction — stok tidak cukup = skip, bukan rollback semua
        foreach ($request->input('records') as $index => $record) {
            $product = Product::find($record['product_id']);

            if (!$product) {
                $failed++;
                $errors[] = ['index' => $index + 1, 'reason' => 'Produk tidak ditemukan'];
                continue;
            }

            if ($product->current_stock < $record['quantity']) {
                $failed++;
                $errors[] = [
                    'index'     => $index + 1,
                    'item_name' => $product->name,
                    'reason'    => "Stok tidak cukup. Tersedia: {$product->current_stock}, dibutuhkan: {$record['quantity']}",
                ];
                continue;
            }

            try {
                DB::beginTransaction();

                $stockOut = StockOut::create([
                    'product_id' => $product->id,
                    'user_id'    => $request->user()->id,
                    'quantity'   => $record['quantity'],
                    'channel'    => $record['channel'],
                    'sell_price' => $record['sell_price'],
                    'date'       => $record['date'],
                    'notes'      => $record['notes'] ?? 'Import historis',
                ]);

                $product->recalculateStock();

                Finance::create([
                    'user_id'      => $request->user()->id,
                    'stock_out_id' => $stockOut->id,
                    'date'         => $record['date'],
                    'description'  => "Import historis: {$product->name} ({$product->sku}) x{$record['quantity']} via {$record['channel']}",
                    'category'     => 'penjualan',
                    'type'         => 'kredit',
                    'amount'       => $record['quantity'] * $record['sell_price'],
                    'notes'        => 'Import historis',
                ]);

                DB::commit();
                $imported++;

            } catch (\Exception $e) {
                DB::rollBack();
                $failed++;
                $errors[] = ['index' => $index + 1, 'item_name' => $product->name, 'reason' => $e->getMessage()];
            }
        }

        $message = "Import barang keluar berhasil. {$imported} dicatat" . ($failed > 0 ? ", {$failed} dilewati" : '') . '.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => ['imported' => $imported, 'failed' => $failed, 'errors' => $errors],
        ], 201);
    }
}
