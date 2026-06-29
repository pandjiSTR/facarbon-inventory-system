<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class InvoiceApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Product $product1;
    private Product $product2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
        $this->product1 = Product::factory()->create();
        $this->product2 = Product::factory()->create();

        // Back stock with actual stock_in records so recalculateStock() works
        StockIn::create([
            'product_id'  => $this->product1->id,
            'user_id'     => $this->user->id,
            'quantity'    => 10,
            'modal_price' => 50000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);
        StockIn::create([
            'product_id'  => $this->product2->id,
            'user_id'     => $this->user->id,
            'quantity'    => 5,
            'modal_price' => 50000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);
        $this->product1->recalculateStock();
        $this->product2->recalculateStock();
    }

    public function test_creates_invoice_with_items(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name'    => 'Test Buyer',
                'buyer_contact' => '08123456789',
                'date'          => now()->format('Y-m-d'),
                'items'         => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 2,
                        'unit_price' => 150000,
                        'channel'    => 'langsung',
                    ],
                    [
                        'product_id' => $this->product2->id,
                        'quantity'   => 1,
                        'unit_price' => 200000,
                        'channel'    => 'online',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $invoiceId = $response->json('data.id');

        $this->assertDatabaseHas('invoice_items', ['invoice_id' => $invoiceId]);
        $this->assertDatabaseHas('stock_out', ['invoice_id' => $invoiceId]);

        // Query stock_out records directly instead of relying on response data
        $stockOut1 = \App\Models\StockOut::where('invoice_id', $invoiceId)
            ->where('product_id', $this->product1->id)->first();

        $this->assertDatabaseHas('finances', [
            'stock_out_id' => $stockOut1->id,
            'type'         => 'kredit',
        ]);

        $this->product1->refresh();
        $this->product2->refresh();
        $this->assertEquals(8, $this->product1->current_stock);
        $this->assertEquals(4, $this->product2->current_stock);
    }

    public function test_deletes_invoice_cascades(): void
    {
        $createResponse = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Test Buyer',
                'date'       => now()->format('Y-m-d'),
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 3,
                        'unit_price' => 100000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $invoiceId = $createResponse->json('data.id');

        $this->withToken($this->token)
            ->deleteJson("/api/invoices/{$invoiceId}")
            ->assertOk();

        $this->assertSoftDeleted('invoices', ['id' => $invoiceId]);
        $this->product1->refresh();
        $this->assertEquals(10, $this->product1->current_stock);
    }

    public function test_rejects_invoice_when_stock_insufficient(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Test Buyer',
                'date'       => now()->format('Y-m-d'),
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 999,
                        'unit_price' => 100000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_lists_invoices(): void
    {
        $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Buyer A',
                'date'       => now()->format('Y-m-d'),
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 50000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/invoices');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_creates_invoice_with_draft_status(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Draft Buyer',
                'date'       => now()->format('Y-m-d'),
                'status'     => 'draft',
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 100000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'draft');
    }

    public function test_creates_invoice_with_paid_status(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Paid Buyer',
                'date'       => now()->format('Y-m-d'),
                'status'     => 'paid',
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 100000,
                        'channel'    => 'online',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'paid');
    }

    public function test_defaults_status_to_confirmed(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Default Buyer',
                'date'       => now()->format('Y-m-d'),
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 100000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'confirmed');
    }

    public function test_rejects_invalid_status(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Bad Status',
                'date'       => now()->format('Y-m-d'),
                'status'     => 'cancelled',
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 100000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_clears_dashboard_cache_on_create(): void
    {
        $key = 'dashboard_' . now()->year . '_' . now()->month;
        Cache::put($key, 'stale');

        $this->withToken($this->token)
            ->postJson('/api/invoices', [
                'buyer_name' => 'Cache Test',
                'date'       => now()->format('Y-m-d'),
                'items'      => [
                    [
                        'product_id' => $this->product1->id,
                        'quantity'   => 1,
                        'unit_price' => 50000,
                        'channel'    => 'langsung',
                    ],
                ],
            ]);

        $this->assertNull(Cache::get($key));
    }
}
