<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class StockOutApiTest extends TestCase
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
        $this->product = Product::factory()->create();

        // Back stock with actual stock_in records so recalculateStock() works
        StockIn::create([
            'product_id'  => $this->product->id,
            'user_id'     => $this->user->id,
            'quantity'    => 20,
            'modal_price' => 50000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);
        $this->product->recalculateStock();
    }

    public function test_creates_stock_out_and_updates_stock(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 5,
                'channel'    => 'langsung',
                'sell_price' => 150000,
                'date'       => now()->format('Y-m-d'),
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->product->refresh();
        $this->assertEquals(15, $this->product->current_stock);

        $this->assertDatabaseHas('finances', [
            'stock_out_id' => $response->json('data.id'),
            'type'         => 'kredit',
            'amount'       => 5 * 150000,
        ]);
    }

    public function test_rejects_stock_out_when_insufficient_stock(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 999,
                'channel'    => 'online',
                'sell_price' => 100000,
                'date'       => now()->format('Y-m-d'),
            ]);

        $response->assertStatus(422);
    }

    public function test_deletes_stock_out_and_recalculates_stock(): void
    {
        $createResponse = $this->withToken($this->token)
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 5,
                'channel'    => 'reseller',
                'sell_price' => 150000,
                'date'       => now()->format('Y-m-d'),
            ]);

        $stockOutId = $createResponse->json('data.id');

        $this->withToken($this->token)
            ->deleteJson("/api/stock-out/{$stockOutId}")
            ->assertOk();

        $this->product->refresh();
        $this->assertEquals(20, $this->product->current_stock);

        $this->assertDatabaseMissing('finances', ['stock_out_id' => $stockOutId]);
    }

    public function test_export_returns_csv(): void
    {
        $this->withToken($this->token)->postJson('/api/stock-out', [
            'product_id' => $this->product->id,
            'quantity'   => 2,
            'channel'    => 'langsung',
            'sell_price' => 150000,
            'date'       => now()->format('Y-m-d'),
        ]);

        $response = $this->withToken($this->token)
            ->get('/api/stock-out/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="stock-out.csv"');
    }

    public function test_clears_dashboard_cache_on_create(): void
    {
        $key = 'dashboard_' . now()->year . '_' . now()->month;
        Cache::put($key, 'stale');

        $this->withToken($this->token)
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 1,
                'channel'    => 'langsung',
                'sell_price' => 100000,
                'date'       => now()->format('Y-m-d'),
            ]);

        $this->assertNull(Cache::get($key));
    }

    public function test_validation_fails_with_invalid_channel(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/stock-out', [
                'product_id' => $this->product->id,
                'quantity'   => 1,
                'channel'    => 'invalid_channel',
                'sell_price' => 100000,
                'date'       => now()->format('Y-m-d'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['channel']);
    }
}
