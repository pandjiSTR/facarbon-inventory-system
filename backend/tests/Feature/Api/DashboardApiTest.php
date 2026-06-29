<?php

namespace Tests\Feature\Api;

use App\Models\Finance;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_returns_empty_dashboard_structure(): void
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'period' => ['month', 'year'],
                    'products' => ['total', 'active', 'out_of_stock', 'low_stock'],
                    'stock' => ['in_this_month', 'out_this_month'],
                    'finances' => ['pemasukan', 'pengeluaran', 'laba_kotor'],
                    'invoices' => ['count', 'amount'],
                    'alerts' => ['out_of_stock_products'],
                    'recent_sales',
                    'monthly_chart',
                ],
            ])
            ->assertJsonPath('data.products.total', 0);
    }

    public function test_returns_correct_counts_with_seeded_data(): void
    {
        $product = Product::factory()->create(['current_stock' => 10, 'is_active' => true]);
        Product::factory()->count(3)->create(['current_stock' => 0, 'is_active' => true]);
        Product::factory()->create(['current_stock' => 1, 'is_active' => true]);

        StockIn::create([
            'product_id' => $product->id, 'user_id' => $this->user->id,
            'quantity' => 10, 'modal_price' => 50000, 'category' => 'produksi',
            'date' => now()->format('Y-m-d'),
        ]);
        StockOut::create([
            'product_id' => $product->id, 'user_id' => $this->user->id,
            'quantity' => 3, 'channel' => 'langsung', 'sell_price' => 150000,
            'date' => now()->format('Y-m-d'),
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/dashboard');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals(5, $data['products']['total']);
        $this->assertEquals(5, $data['products']['active']);
        $this->assertEquals(3, $data['products']['out_of_stock']);
        $this->assertEquals(1, $data['products']['low_stock']);
        $this->assertEquals(10, $data['stock']['in_this_month']);
        $this->assertEquals(3, $data['stock']['out_this_month']);
        $this->assertCount(3, $data['alerts']['out_of_stock_products']);
        $this->assertCount(1, $data['recent_sales']);
    }

    public function test_returns_finances_data(): void
    {
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Income', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 500000]);
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Expense', 'category' => 'operasional', 'type' => 'debit', 'amount' => 150000]);

        $response = $this->withToken($this->token)
            ->getJson('/api/dashboard');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals(500000, $data['finances']['pemasukan']);
        $this->assertEquals(150000, $data['finances']['pengeluaran']);
        $this->assertEquals(350000, $data['finances']['laba_kotor']);
    }

    public function test_returns_invoices_data(): void
    {
        StockIn::create([
            'product_id' => Product::factory()->create()->id, 'user_id' => $this->user->id,
            'quantity' => 10, 'modal_price' => 50000, 'category' => 'produksi',
            'date' => now()->format('Y-m-d'),
        ]);

        $invoice = Invoice::create([
            'invoice_number' => 'INV/2026/001', 'user_id' => $this->user->id,
            'buyer_name' => 'Buyer', 'date' => now()->format('Y-m-d'),
            'total_amount' => 300000, 'status' => 'confirmed',
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/dashboard');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals(1, $data['invoices']['count']);
        $this->assertEquals(300000, $data['invoices']['amount']);
    }

    public function test_monthly_chart_has_six_months(): void
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/dashboard');

        $response->assertOk();
        $this->assertCount(6, $response->json('data.monthly_chart'));
    }

    public function test_is_cached(): void
    {
        $cacheKey = 'dashboard_' . now()->year . '_' . now()->month;
        Cache::forget($cacheKey);

        $this->withToken($this->token)->getJson('/api/dashboard');

        $this->assertNotNull(Cache::get($cacheKey));
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }
}
