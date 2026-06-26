<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\StockOut;
use App\Models\Finance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * GET /api/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['user:id,name', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('buyer_name')) {
            $query->where('buyer_name', 'like', '%' . $request->buyer_name . '%');
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $perPage = min((int) $request->get('per_page', 25), 100);
        $invoices = $query->orderByDesc('date')->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $invoices->items(),
            'meta'    => [
                'total'        => $invoices->total(),
                'total_amount' => collect($invoices->items())->sum('total_amount'),
                'per_page'     => $invoices->perPage(),
                'current_page' => $invoices->currentPage(),
                'last_page'    => $invoices->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/invoices
     * Buat invoice + items + stock_out + finances sekaligus
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'buyer_name'          => 'required|string|max:255',
            'buyer_contact'       => 'nullable|string|max:255',
            'date'                => 'required|date',
            'status'              => 'in:draft,confirmed,paid',
            'notes'               => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'required|exists:products,id',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|integer|min:0',
            'items.*.channel'     => 'required|in:reseller,online,langsung',
        ]);

        DB::beginTransaction();
        try {
            // 1. Generate nomor invoice
            $invoiceNumber = Invoice::generateNumber();

            // 2. Hitung total
            $totalAmount = collect($validated['items'])
                ->sum(fn($item) => $item['quantity'] * $item['unit_price']);

            // 3. Buat invoice
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'user_id'        => $request->user()->id,
                'buyer_name'     => $validated['buyer_name'],
                'buyer_contact'  => $validated['buyer_contact'] ?? null,
                'date'           => $validated['date'],
                'total_amount'   => $totalAmount,
                'status'         => $validated['status'] ?? 'confirmed',
                'notes'          => $validated['notes'] ?? null,
            ]);

            // 4. Proses setiap item
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);

                // Cek stok
                if ($product->current_stock < $item['quantity']) {
                    throw new \Exception("Stok {$product->name} ({$product->sku}) tidak cukup. Tersedia: {$product->current_stock}");
                }

                // Buat invoice item (snapshot nama produk)
                InvoiceItem::create([
                    'invoice_id'   => $invoice->id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'product_sku'  => $product->sku,
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $item['unit_price'],
                    'subtotal'     => $item['quantity'] * $item['unit_price'],
                ]);

                // Buat stock_out
                $stockOut = StockOut::create([
                    'product_id' => $product->id,
                    'user_id'    => $request->user()->id,
                    'quantity'   => $item['quantity'],
                    'channel'    => $item['channel'],
                    'sell_price' => $item['unit_price'],
                    'invoice_id' => $invoice->id,
                    'date'       => $validated['date'],
                    'notes'      => "Invoice #{$invoiceNumber}",
                ]);

                // Update stok
                $product->recalculateStock();

                // Buat finance
                Finance::create([
                    'user_id'      => $request->user()->id,
                    'stock_out_id' => $stockOut->id,
                    'date'         => $validated['date'],
                    'description'  => "Penjualan invoice #{$invoiceNumber}: {$product->name} x{$item['quantity']}",
                    'category'     => 'penjualan',
                    'type'         => 'kredit',
                    'amount'       => $item['quantity'] * $item['unit_price'],
                ]);
            }

            DB::commit();

            $this->forgetDashboardCache($validated['date']);

            return response()->json([
                'success' => true,
                'message' => "Invoice {$invoiceNumber} berhasil dibuat.",
                'data'    => $invoice->load(['items', 'user:id,name']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat invoice: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/invoices/{id}
     */
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $invoice->load(['items.product:id,sku,name', 'user:id,name', 'stockOuts']),
        ]);
    }

    /**
     * DELETE /api/invoices/{id}
     */
    public function destroy(Invoice $invoice): JsonResponse
    {
        DB::beginTransaction();
        try {
            // Hapus finance & stock_out terkait, lalu recalculate stok
            foreach ($invoice->stockOuts as $stockOut) {
                $product = $stockOut->product;
                $stockOut->finance()->delete();
                $stockOut->delete();
                $product->recalculateStock();
            }

            $invoice->items()->delete();
            $invoice->delete();

            DB::commit();

            $this->forgetDashboardCache($invoice->date);

            return response()->json([
                'success' => true,
                'message' => 'Invoice berhasil dihapus.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus invoice: ' . $e->getMessage(),
            ], 500);
        }
    }
}
