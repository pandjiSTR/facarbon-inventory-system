<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ImportController;

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/register', [AuthController::class, 'register']);
});

// ─── PROTECTED ────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::patch('/products/{product}/toggle-active', [ProductController::class, 'toggleActive']);
    Route::get('/products/{product}/stock-history',   [ProductController::class, 'stockHistory']);

    // Stock In
    Route::apiResource('stock-in', StockInController::class)->except(['update']);

    // Stock Out
    Route::apiResource('stock-out', StockOutController::class)->except(['update']);

    // Finances
    Route::get('/finances/summary',  [FinanceController::class, 'summary']);
    Route::get('/finances',          [FinanceController::class, 'index']);
    Route::get('/finances/{finance}',[FinanceController::class, 'show']);
    Route::post('/finances',         [FinanceController::class, 'store']);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class)->except(['update']);

    // Import Historis
    Route::prefix('import')->group(function () {
        // Keuangan
        Route::post('/finance/preview',    [ImportController::class, 'financePreview']);
        Route::post('/finance/confirm',    [ImportController::class, 'financeConfirm']);
        // Barang Masuk
        Route::post('/stock-in/preview',   [ImportController::class, 'stockInPreview']);
        Route::post('/stock-in/confirm',   [ImportController::class, 'stockInConfirm']);
        // Barang Keluar
        Route::post('/stock-out/preview',  [ImportController::class, 'stockOutPreview']);
        Route::post('/stock-out/confirm',  [ImportController::class, 'stockOutConfirm']);
    });

});
