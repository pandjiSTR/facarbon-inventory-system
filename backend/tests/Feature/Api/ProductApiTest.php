<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
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

    public function test_lists_products(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/products');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_creates_product(): void
    {
        $payload = [
            'sku'                 => 'FAC-999',
            'name'                => 'Test Product',
            'carbon_type'         => 'forged',
            'vespa_compatibility' => ['Sprint S'],
            'modal_price'         => 100000,
            'reseller_price'      => 150000,
            'online_price'        => 175000,
        ];

        $response = $this->withToken($this->token)
            ->postJson('/api/products', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('products', ['sku' => 'FAC-999']);
    }

    public function test_shows_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/products/{$product->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $product->id);
    }

    public function test_updates_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->withToken($this->token)
            ->putJson("/api/products/{$product->id}", ['name' => 'Updated']);

        $response->assertOk();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated']);
    }

    public function test_deletes_product_only_when_stock_zero(): void
    {
        $product = Product::factory()->create(['current_stock' => 5]);

        $response = $this->withToken($this->token)
            ->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(422);

        $product->current_stock = 0;
        $product->save();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/products/{$product->id}");

        $response->assertOk();
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_toggles_active(): void
    {
        $product = Product::factory()->create(['is_active' => true]);

        $response = $this->withToken($this->token)
            ->patchJson("/api/products/{$product->id}/toggle-active");

        $response->assertOk();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'is_active' => 0]);
    }

    public function test_shows_stock_history(): void
    {
        $product = Product::factory()->create(['current_stock' => 0]);
        StockIn::factory()->count(2)->create(['product_id' => $product->id, 'quantity' => 5]);
        StockOut::factory()->create(['product_id' => $product->id, 'quantity' => 3]);

        $response = $this->withToken($this->token)
            ->getJson("/api/products/{$product->id}/stock-history");

        $response->assertOk()
            ->assertJsonPath('data.product.id', $product->id)
            ->assertJsonPath('data.total_in', 10)
            ->assertJsonPath('data.total_out', 3)
            ->assertJsonCount(2, 'data.stock_in')
            ->assertJsonCount(1, 'data.stock_out');
    }

    public function test_creates_product_with_photo(): void
    {
        Storage::fake('public');

        $response = $this->withToken($this->token)
            ->post('/api/products', [
                'sku'                 => 'FAC-PHOTO',
                'name'                => 'Photo Product',
                'carbon_type'         => 'forged',
                'vespa_compatibility' => ['LX'],
                'modal_price'         => 50000,
                'reseller_price'      => 100000,
                'online_price'        => 120000,
                'photo'               => UploadedFile::fake()->image('product.jpg', 500, 500),
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('products', ['sku' => 'FAC-PHOTO']);
        $this->assertNotNull($response->json('data.photo'));
    }

    public function test_rejects_photo_with_invalid_dimensions(): void
    {
        Storage::fake('public');

        $response = $this->withToken($this->token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/products', [
                'sku'                 => 'FAC-BADIMG',
                'name'                => 'Bad Photo',
                'carbon_type'         => 'twill',
                'vespa_compatibility' => ['Universal'],
                'modal_price'         => 50000,
                'reseller_price'      => 100000,
                'photo'               => UploadedFile::fake()->image('small.jpg', 50, 50),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }

    public function test_rejects_photo_with_wrong_mime_type(): void
    {
        Storage::fake('public');

        $response = $this->withToken($this->token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/products', [
                'sku'                 => 'FAC-BADMIME',
                'name'                => 'Bad Mime',
                'carbon_type'         => 'forged',
                'vespa_compatibility' => ['Sprint S'],
                'modal_price'         => 50000,
                'reseller_price'      => 100000,
                'photo'               => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }

    public function test_export_returns_csv(): void
    {
        Product::factory()->create(['sku' => 'FAC-001', 'name' => 'Test Product']);

        $response = $this->withToken($this->token)
            ->get('/api/products/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="products.csv"');
    }

    public function test_export_includes_csv_header(): void
    {
        Product::factory()->create(['sku' => 'FAC-001', 'name' => 'CSV Test']);

        $response = $this->withToken($this->token)
            ->get('/api/products/export');

        $content = $response->streamedContent();
        $this->assertStringContainsString('"Carbon Type"', $content);
        $this->assertStringContainsString('FAC-001', $content);
    }

    public function test_clears_dashboard_cache_on_create(): void
    {
        $key = 'dashboard_' . now()->year . '_' . now()->month;
        Cache::put($key, 'stale');

        $this->withToken($this->token)
            ->postJson('/api/products', [
                'sku'                 => 'FAC-CACHE',
                'name'                => 'Cache Test',
                'carbon_type'         => 'forged',
                'vespa_compatibility' => ['LX'],
                'modal_price'         => 50000,
                'reseller_price'      => 100000,
            ]);

        $this->assertNull(Cache::get($key));
    }
}
