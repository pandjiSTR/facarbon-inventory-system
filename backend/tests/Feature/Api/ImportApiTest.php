<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportApiTest extends TestCase
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

        // Back stock with actual stock_in records so recalculateStock() works for stock-out tests
        StockIn::create([
            'product_id'  => $this->product->id,
            'user_id'     => $this->user->id,
            'quantity'    => 10,
            'modal_price' => 50000,
            'category'    => 'produksi',
            'date'        => now()->format('Y-m-d'),
        ]);
        $this->product->recalculateStock();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PREVIEW — Finance
    // ══════════════════════════════════════════════════════════════════════════

    public function test_finance_preview_rejects_request_without_file(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/finance/preview', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_finance_preview_rejects_invalid_file_type(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('data.txt', 100);

        $response = $this->withToken($this->token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/import/finance/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PREVIEW — Stock In
    // ══════════════════════════════════════════════════════════════════════════

    public function test_stock_in_preview_rejects_request_without_file(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/stock-in/preview', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_stock_in_preview_rejects_invalid_file_type(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('data.pdf', 200);

        $response = $this->withToken($this->token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/import/stock-in/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PREVIEW — Stock Out
    // ══════════════════════════════════════════════════════════════════════════

    public function test_stock_out_preview_rejects_request_without_file(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/stock-out/preview', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_stock_out_preview_rejects_invalid_file_type(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('image.png', 300);

        $response = $this->withToken($this->token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/import/stock-out/preview', [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONFIRM — Finance
    // ══════════════════════════════════════════════════════════════════════════

    public function test_finance_confirm_creates_records(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/finance/confirm', [
                'records' => [
                    [
                        'date'        => now()->format('Y-m-d'),
                        'description' => 'Import biaya operasional',
                        'type'        => 'debit',
                        'category'    => 'operasional',
                        'amount'      => 250000,
                    ],
                    [
                        'date'        => now()->format('Y-m-d'),
                        'description' => 'Import pendapatan jasa',
                        'type'        => 'kredit',
                        'category'    => 'penjualan',
                        'amount'      => 750000,
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported', 2)
            ->assertJsonPath('data.failed', 0);

        $this->assertDatabaseHas('finances', [
            'description' => 'Import biaya operasional',
            'type'        => 'debit',
            'amount'      => 250000,
        ]);
        $this->assertDatabaseHas('finances', [
            'description' => 'Import pendapatan jasa',
            'type'        => 'kredit',
            'amount'      => 750000,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONFIRM — Stock In
    // ══════════════════════════════════════════════════════════════════════════

    public function test_stock_in_confirm_creates_records(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/stock-in/confirm', [
                'records' => [
                    [
                        'product_id'  => $this->product->id,
                        'quantity'    => 5,
                        'modal_price' => 60000,
                        'category'    => 'pembelian_stok',
                        'date'        => now()->format('Y-m-d'),
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported', 1);

        $this->product->refresh();
        $this->assertEquals(15, $this->product->current_stock);

        $stockInId = \App\Models\StockIn::max('id');

        $this->assertDatabaseHas('finances', [
            'stock_in_id' => $stockInId,
            'type'        => 'debit',
            'amount'      => 5 * 60000,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONFIRM — Stock Out
    // ══════════════════════════════════════════════════════════════════════════

    public function test_stock_out_confirm_creates_records_when_stock_sufficient(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/import/stock-out/confirm', [
                'records' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity'   => 3,
                        'sell_price' => 150000,
                        'channel'    => 'langsung',
                        'date'       => now()->format('Y-m-d'),
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported', 1)
            ->assertJsonPath('data.failed', 0);

        $this->product->refresh();
        $this->assertEquals(7, $this->product->current_stock);

        $this->assertDatabaseHas('stock_out', [
            'product_id' => $this->product->id,
            'quantity'   => 3,
        ]);
    }

    public function test_stock_out_confirm_skips_record_when_stock_insufficient(): void
    {
        // Product with no stock
        $lowStockProduct = Product::factory()->create(['current_stock' => 0]);

        $response = $this->withToken($this->token)
            ->postJson('/api/import/stock-out/confirm', [
                'records' => [
                    [
                        'product_id' => $lowStockProduct->id,
                        'quantity'   => 5,
                        'sell_price' => 100000,
                        'channel'    => 'online',
                        'date'       => now()->format('Y-m-d'),
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported', 0)
            ->assertJsonPath('data.failed', 1)
            ->assertJsonStructure(['data' => ['errors' => [['index', 'item_name', 'reason']]]]);

        $this->assertDatabaseMissing('stock_out', [
            'product_id' => $lowStockProduct->id,
        ]);
    }
}
