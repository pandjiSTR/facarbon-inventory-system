<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    /**
     * GET /api/finances
     */
    public function index(Request $request): JsonResponse
    {
        $query = Finance::with(['user:id,name', 'stockIn.product:id,sku,name', 'stockOut.product:id,sku,name']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
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
        $finances = $query->orderByDesc('date')->orderByDesc('id')->paginate($perPage);

        // Calculate grand totals (all records matching filters, not just current page)
        $baseQuery = Finance::query()
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->type))
            ->when($request->filled('category'), fn($q) => $q->where('category', $request->category))
            ->when($request->filled('date_from'), fn($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) => $q->whereDate('date', '<=', $request->date_to));

        $totalKredit = (clone $baseQuery)->where('type', 'kredit')->sum('amount');
        $totalDebit  = (clone $baseQuery)->where('type', 'debit')->sum('amount');

        return response()->json([
            'success' => true,
            'data'    => $finances->items(),
            'meta'    => [
                'total_kredit' => $totalKredit,
                'total_debit'  => $totalDebit,
                'saldo'        => $totalKredit - $totalDebit,
                'per_page'     => $finances->perPage(),
                'current_page' => $finances->currentPage(),
                'last_page'    => $finances->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/finances/{id}
     */
    public function show(Finance $finance): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $finance->load(['user:id,name', 'stockIn.product', 'stockOut.product']),
        ]);
    }

    /**
     * POST /api/finances — entry manual (operasional, lain-lain)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'        => 'required|date',
            'description' => 'required|string|max:255',
            'category'    => 'required|in:pembelian_stok,produksi,penjualan,operasional,lain_lain',
            'type'        => 'required|in:debit,kredit',
            'amount'      => 'required|integer|min:1',
            'notes'       => 'nullable|string',
        ]);

        $finance = Finance::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        $this->forgetDashboardCache($validated['date']);

        return response()->json([
            'success' => true,
            'message' => 'Catatan keuangan berhasil ditambahkan.',
            'data'    => $finance,
        ], 201);
    }

    /**
     * GET /api/finances/export
     */
    public function export(): StreamedResponse
    {
        $records = Finance::with('stockIn.product:id,sku,name', 'stockOut.product:id,sku,name')
            ->orderByDesc('date')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="finances.csv"',
        ];

        $callback = function () use ($records) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah', 'Produk', 'Catatan']);

            foreach ($records as $r) {
                $produk = $r->stockIn?->product?->name ?? $r->stockOut?->product?->name ?? '-';
                fputcsv($handle, [
                    $r->date,
                    $r->description,
                    $r->category,
                    $r->type,
                    $r->amount,
                    $produk,
                    $r->notes ?? '',
                ]);
            }
            fclose($handle);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    /**
     * GET /api/finances/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $year  = $request->get('year', now()->year);
        $month = $request->get('month'); // opsional

        $query = Finance::whereYear('date', $year);
        if ($month) {
            $query->whereMonth('date', $month);
        }

        $data = $query->selectRaw("
                category,
                type,
                SUM(amount) as total,
                COUNT(*) as count
            ")
            ->groupBy('category', 'type')
            ->get();

        $totalKredit = $query->where('type', 'kredit')->sum('amount');
        $totalDebit  = Finance::whereYear('date', $year)
            ->when($month, fn($q) => $q->whereMonth('date', $month))
            ->where('type', 'debit')->sum('amount');

        return response()->json([
            'success' => true,
            'data'    => [
                'year'          => $year,
                'month'         => $month,
                'breakdown'     => $data,
                'total_kredit'  => $totalKredit,
                'total_debit'   => $totalDebit,
                'saldo'         => $totalKredit - $totalDebit,
            ],
        ]);
    }
}
