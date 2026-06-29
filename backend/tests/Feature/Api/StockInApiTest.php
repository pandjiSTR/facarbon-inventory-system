<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class StockInApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
        $this->product = Product::factory()->create(['current_stock' => 0]);
    }

    public function test_creates_stock_in_and_updates_stock(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/stock-in', [
                'product_id'  => $this->product->id,
                'quantity'    => 10,
                'modal_price' => 50000,
                'category'    => 'pembelian_stok',
                'date'        => now()->format('Y-m-d'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->product->refresh();
        $this->assertEquals(10, $this->product->current_stock);

        $this->assertDatabaseHas('finances', [
            'stock_in_id' => $response->json('data.id'),
            'type'        => 'debit',
            'amount'      => 10 * 50000,
        ]);
    }

    public function test_lists_stock_in(): void
    {
        $this->withToken($this->token)->postJson('/api/stock-in', [
            'product_id'  => $this->product->id,
            'quantity'    => 5,
            'modal_price' => 30000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/stock-in');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_deletes_stock_in_and_recalculates_stock(): void
    {
        $createResponse = $this->withToken($this->token)
            ->postJson('/api/stock-in', [
                'product_id'  => $this->product->id,
                'quantity'    => 10,
                'modal_price' => 50000,
                'category'    => 'pembelian_stok',
                'date'        => now()->format('Y-m-d'),
            ]);

        $stockInId = $createResponse->json('data.id');

        $this->withToken($this->token)
            ->deleteJson("/api/stock-in/{$stockInId}")
            ->assertOk();

        $this->product->refresh();
        $this->assertEquals(0, $this->product->current_stock);

        $this->assertDatabaseMissing('finances', ['stock_in_id' => $stockInId]);
    }

    public function test_export_returns_csv(): void
    {
        $this->withToken($this->token)->postJson('/api/stock-in', [
            'product_id'  => $this->product->id,
            'quantity'    => 5,
            'modal_price' => 30000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);

        $response = $this->withToken($this->token)
            ->get('/api/stock-in/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="stock-in.csv"');
    }

    public function test_clears_dashboard_cache_on_create(): void
    {
        $key = 'dashboard_' . now()->year . '_' . now()->month;
        Cache::put($key, 'stale');

        $this->withToken($this->token)
            ->postJson('/api/stock-in', [
                'product_id'  => $this->product->id,
                'quantity'    => 1,
                'modal_price' => 10000,
                'category'    => 'produksi',
                'date'        => now()->format('Y-m-d'),
            ]);

        $this->assertNull(Cache::get($key));
    }

    public function test_validation_fails_with_invalid_category(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/stock-in', [
                'product_id'  => $this->product->id,
                'quantity'    => 1,
                'modal_price' => 10000,
                'category'    => 'invalid_category',
                'date'        => now()->format('Y-m-d'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }
}
