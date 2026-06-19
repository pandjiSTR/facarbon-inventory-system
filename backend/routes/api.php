<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes — Facarbon Inventory System
|--------------------------------------------------------------------------
| Prefix: /api/
| Auth: Laravel Sanctum token-based (Authorization: Bearer <token>)
*/

// ─── PUBLIC ROUTES (tidak butuh auth) ────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']); // bisa di-disable di production
});

// ─── PROTECTED ROUTES (butuh Sanctum token) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    // Dashboard & Summary
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
    Route::get('/finances',         [FinanceController::class, 'index']);
    Route::get('/finances/{finance}',[FinanceController::class, 'show']);
    Route::post('/finances',        [FinanceController::class, 'store']);   // manual entry
    Route::get('/finances/summary', [FinanceController::class, 'summary']);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class)->except(['update']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);

});


// ─── TEMPORARY ROUTE UNTUK SEEDING ADMIN ─────────────────────────────────────
Route::get('/run-seeder-facarbon', function () {
    try {
        // Ini bakal nge-run DatabaseSeeder lu buat bikin akun admin pertama
        \Illuminate\Support\Facades\Artisan::call('db:seed --force');
        return response()->json([
            'status' => 'success',
            'message' => 'Akun Admin Facarbon BERHASIL dimasukkan ke cloud!',
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});