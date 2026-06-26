<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StockOutController extends Controller
{
    /**
     * GET /api/stock-out
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockOut::with(['product:id,sku,name,carbon_type', 'user:id,name', 'invoice:id,invoice_number']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $perPage = min((int) $request->get('per_page', 25), 100);
        $stockOuts = $query->orderByDesc('date')->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $stockOuts->items(),
            'meta'    => [
                'total_quantity' => collect($stockOuts->items())->sum('quantity'),
                'total_revenue'  => collect($stockOuts->items())->sum(fn($s) => $s->quantity * $s->sell_price),
                'per_page'       => $stockOuts->perPage(),
                'current_page'   => $stockOuts->currentPage(),
                'last_page'      => $stockOuts->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/stock-out
     * Otomatis update current_stock & buat record finances
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'channel'    => 'required|in:reseller,online,langsung',
            'sell_price' => 'required|integer|min:0',
            'invoice_id' => 'nullable|exists:invoices,id',
            'date'       => 'required|date',
            'notes'      => 'nullable|string',
        ]);

        // Cek stok cukup
        $product = \App\Models\Product::findOrFail($validated['product_id']);
        if ($product->current_stock < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => "Stok tidak cukup. Stok tersedia: {$product->current_stock} unit.",
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Buat record stock_out
            $stockOut = StockOut::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            // 2. Update current_stock
            $product->recalculateStock();

            // 3. Otomatis buat record finances (kredit = pemasukan)
            Finance::create([
                'user_id'      => $request->user()->id,
                'stock_out_id' => $stockOut->id,
                'date'         => $validated['date'],
                'description'  => "Penjualan: {$product->name} ({$product->sku}) x{$validated['quantity']} via {$validated['channel']}",
                'category'     => 'penjualan',
                'type'         => 'kredit',
                'amount'       => $validated['quantity'] * $validated['sell_price'],
                'notes'        => $validated['notes'] ?? null,
            ]);

            DB::commit();

            $this->forgetDashboardCache($validated['date']);

            // Notifikasi stok kosong
            $product->refresh();
            $message = 'Stok keluar berhasil dicatat.';
            if ($product->isOutOfStock()) {
                $message .= ' ⚠️ Stok produk ini sekarang KOSONG!';
            }

            return response()->json([
                'success'        => true,
                'message'        => $message,
                'out_of_stock'   => $product->isOutOfStock(),
                'data'           => $stockOut->load(['product:id,sku,name,current_stock', 'user:id,name']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat stok keluar: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/stock-out/{id}
     */
    public function show(StockOut $stockOut): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $stockOut->load(['product', 'user:id,name', 'invoice', 'finance']),
        ]);
    }

    /**
     * GET /api/stock-out/export
     */
    public function export(): StreamedResponse
    {
        $records = StockOut::with('product:id,sku,name')->orderByDesc('date')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="stock-out.csv"',
        ];

        $callback = function () use ($records) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Produk', 'SKU', 'Channel', 'Qty', 'Harga Jual', 'Total', 'Catatan']);

            foreach ($records as $r) {
                fputcsv($handle, [
                    $r->date,
                    $r->product?->name ?? '-',
                    $r->product?->sku ?? '-',
                    $r->channel,
                    $r->quantity,
                    $r->sell_price,
                    $r->quantity * $r->sell_price,
                    $r->notes ?? '',
                ]);
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * DELETE /api/stock-out/{id}
     */
    public function destroy(StockOut $stockOut): JsonResponse
    {
        DB::beginTransaction();
        try {
            $product = $stockOut->product;

            $stockOut->finance()->delete();
            $stockOut->delete();
            $product->recalculateStock();

            DB::commit();

            $this->forgetDashboardCache($stockOut->date);

            return response()->json([
                'success' => true,
                'message' => 'Stok keluar berhasil dihapus.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: ' . $e->getMessage(),
            ], 500);
        }
    }
}
