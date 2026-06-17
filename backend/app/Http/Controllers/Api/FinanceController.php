<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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

        $finances = $query->orderByDesc('date')->orderByDesc('id')->get();

        $totalKredit = $finances->where('type', 'kredit')->sum('amount');
        $totalDebit  = $finances->where('type', 'debit')->sum('amount');

        return response()->json([
            'success' => true,
            'data'    => $finances,
            'meta'    => [
                'total_kredit' => $totalKredit,
                'total_debit'  => $totalDebit,
                'saldo'        => $totalKredit - $totalDebit,
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

        return response()->json([
            'success' => true,
            'message' => 'Catatan keuangan berhasil ditambahkan.',
            'data'    => $finance,
        ], 201);
    }

    /**
     * GET /api/finances/summary
     * Ringkasan per bulan/tahun
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
