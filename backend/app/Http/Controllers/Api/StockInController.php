<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance;
use App\Models\StockIn;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StockInController extends Controller
{
    /**
     * GET /api/stock-in
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockIn::with(['product:id,sku,name,carbon_type', 'user:id,name']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $perPage = min((int) $request->get('per_page', 25), 100);
        $stockIns = $query->orderByDesc('date')->orderByDesc('id')->paginate($perPage);

        // Calculate grand totals (all records matching filters, not just current page)
        $totalQuantity = StockIn::query()
            ->when($request->filled('product_id'), fn($q) => $q->where('product_id', $request->product_id))
            ->when($request->filled('category'), fn($q) => $q->where('category', $request->category))
            ->when($request->filled('date_from'), fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->whereDate('date', '<=', $request->date_to))
            ->sum('quantity');

        $totalModal = StockIn::query()
            ->when($request->filled('product_id'), fn($q) => $q->where('product_id', $request->product_id))
            ->when($request->filled('category'), fn($q) => $q->where('category', $request->category))
            ->when($request->filled('date_from'), fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->whereDate('date', '<=', $request->date_to))
            ->sum(DB::raw('quantity * modal_price'));

        return response()->json([
            'success' => true,
            'data'    => $stockIns->items(),
            'meta'    => [
                'total_quantity' => $totalQuantity,
                'total_modal'    => $totalModal,
                'per_page'       => $stockIns->perPage(),
                'current_page'   => $stockIns->currentPage(),
                'last_page'      => $stockIns->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/stock-in
     * Otomatis update current_stock & buat record finances
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'quantity'    => 'required|integer|min:1',
            'modal_price' => 'required|integer|min:0',
            'category'    => 'required|in:pembelian_stok,produksi',
            'date'        => 'required|date',
            'notes'       => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // 1. Buat record stock_in
            $stockIn = StockIn::create([
                ...$validated,
                'user_id' => $request->user()->id,
            ]);

            // 2. Update current_stock produk
            $stockIn->product->recalculateStock();

            // 3. Otomatis buat record finances (debit = pengeluaran modal)
            Finance::create([
                'user_id'     => $request->user()->id,
                'stock_in_id' => $stockIn->id,
                'date'        => $validated['date'],
                'description' => "Stok masuk: {$stockIn->product->name} ({$stockIn->product->sku}) x{$validated['quantity']}",
                'category'    => $validated['category'],
                'type'        => 'debit',
                'amount'      => $validated['quantity'] * $validated['modal_price'],
                'notes'       => $validated['notes'] ?? null,
            ]);

            DB::commit();

            $this->forgetDashboardCache($validated['date']);

            return response()->json([
                'success' => true,
                'message' => 'Stok masuk berhasil dicatat.',
                'data'    => $stockIn->load(['product:id,sku,name,current_stock', 'user:id,name']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat stok masuk: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/stock-in/{id}
     */
    public function show(StockIn $stockIn): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $stockIn->load(['product', 'user:id,name', 'finance']),
        ]);
    }

    /**
     * GET /api/stock-in/export
     */
    public function export(): StreamedResponse
    {
        $records = StockIn::with('product:id,sku,name')->orderByDesc('date')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="stock-in.csv"',
        ];

        $callback = function () use ($records) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Produk', 'SKU', 'Kategori', 'Qty', 'Harga Modal', 'Total', 'Catatan']);

            foreach ($records as $r) {
                fputcsv($handle, [
                    $r->date,
                    $r->product?->name ?? '-',
                    $r->product?->sku ?? '-',
                    $r->category === 'pembelian_stok' ? 'Pembelian' : 'Produksi',
                    $r->quantity,
                    $r->modal_price,
                    $r->quantity * $r->modal_price,
                    $r->notes ?? '',
                ]);
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * DELETE /api/stock-in/{id}
     */
    public function destroy(StockIn $stockIn): JsonResponse
    {
        DB::beginTransaction();
        try {
            $product = $stockIn->product;

            // Hapus finance terkait
            $stockIn->finance()->delete();

            // Hapus stock_in
            $stockIn->delete();

            // Recalculate stok
            $product->recalculateStock();

            DB::commit();

            $this->forgetDashboardCache($stockIn->date);

            return response()->json([
                'success' => true,
                'message' => 'Stok masuk berhasil dihapus.',
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
