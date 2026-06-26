<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     * Ringkasan untuk halaman utama
     */
    public function index(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);
        $cacheKey = "dashboard_{$year}_{$month}";

        $data = Cache::remember($cacheKey, 300, function () use ($month, $year) {

            // ── Statistik Produk ──────────────────────────────────────────────
            $totalProducts   = Product::count();
            $activeProducts  = Product::where('is_active', true)->count();
            $outOfStock      = Product::where('current_stock', 0)->where('is_active', true)->count();
            $lowStock        = Product::where('current_stock', '>', 0)
                                      ->where('current_stock', '<=', 3)
                                      ->where('is_active', true)
                                      ->count();

            // ── Stok Bulan Ini ────────────────────────────────────────────────
            $stockInMonth  = StockIn::whereYear('date', $year)->whereMonth('date', $month)->sum('quantity');
            $stockOutMonth = StockOut::whereYear('date', $year)->whereMonth('date', $month)->sum('quantity');

            // ── Keuangan Bulan Ini ────────────────────────────────────────────
            $financeMonth = Finance::whereYear('date', $year)->whereMonth('date', $month);
            $pemasukanBulanIni  = (clone $financeMonth)->where('type', 'kredit')->sum('amount');
            $pengeluaranBulanIni = (clone $financeMonth)->where('type', 'debit')->sum('amount');

            // ── Grafik 6 Bulan Terakhir ───────────────────────────────────────
            $monthlyChart = [];
            for ($i = 5; $i >= 0; $i--) {
                $m = now()->subMonths($i);
                $y = $m->year;
                $mo = $m->month;
                $monthlyChart[] = [
                    'month'  => $mo,
                    'year'   => $y,
                    'label'  => $m->translatedFormat('M'),
                    'masuk'  => StockIn::whereYear('date', $y)->whereMonth('date', $mo)->sum('quantity'),
                    'keluar' => StockOut::whereYear('date', $y)->whereMonth('date', $mo)->sum('quantity'),
                ];
            }

            // ── Invoice Bulan Ini ─────────────────────────────────────────────
            $invoiceCount  = Invoice::whereYear('date', $year)->whereMonth('date', $month)->count();
            $invoiceAmount = Invoice::whereYear('date', $year)->whereMonth('date', $month)->sum('total_amount');

            // ── Produk Stok Kosong ────────────────────────────────────────────
            $outOfStockProducts = Product::where('current_stock', 0)
                ->where('is_active', true)
                ->select('id', 'sku', 'name', 'carbon_type', 'vespa_compatibility', 'current_stock')
                ->get();

            // ── Transaksi Terbaru ─────────────────────────────────────────────
            $recentStockOut = StockOut::with('product:id,sku,name')
                ->orderByDesc('date')->orderByDesc('id')
                ->limit(5)->get();

            return [
                'period' => ['month' => $month, 'year' => $year],

                'products' => [
                    'total'         => $totalProducts,
                    'active'        => $activeProducts,
                    'out_of_stock'  => $outOfStock,
                    'low_stock'     => $lowStock,
                ],

                'stock' => [
                    'in_this_month'  => $stockInMonth,
                    'out_this_month' => $stockOutMonth,
                ],

                'finances' => [
                    'pemasukan'   => $pemasukanBulanIni,
                    'pengeluaran' => $pengeluaranBulanIni,
                    'laba_kotor'  => $pemasukanBulanIni - $pengeluaranBulanIni,
                ],

                'invoices' => [
                    'count'  => $invoiceCount,
                    'amount' => $invoiceAmount,
                ],

                'alerts' => [
                    'out_of_stock_products' => $outOfStockProducts,
                ],

                'recent_sales'  => $recentStockOut,
                'monthly_chart' => $monthlyChart,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }
}
