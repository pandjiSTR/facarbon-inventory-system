<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
