<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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
}
