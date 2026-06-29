<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_photo_url_returns_null_when_no_photo(): void
    {
        $product = Product::factory()->create(['photo' => null]);

        $this->assertNull($product->photo_url);
    }

    public function test_photo_url_returns_url_when_photo_exists(): void
    {
        $product = Product::factory()->create(['photo' => 'photos/test.jpg']);

        $this->assertNotNull($product->photo_url);
        $this->assertStringContainsString('photos/test.jpg', $product->photo_url);
    }

    public function test_is_out_of_stock_returns_true_when_stock_zero(): void
    {
        $product = Product::factory()->create(['current_stock' => 0]);

        $this->assertTrue($product->isOutOfStock());
    }

    public function test_is_out_of_stock_returns_false_when_stock_positive(): void
    {
        $product = Product::factory()->create(['current_stock' => 10]);

        $this->assertFalse($product->isOutOfStock());
    }

    public function test_recalculate_stock_from_scratch(): void
    {
        $product = Product::factory()->create(['current_stock' => 0]);

        StockIn::factory()->count(2)->create([
            'product_id' => $product->id,
            'quantity'   => 10,
        ]);

        StockOut::factory()->create([
            'product_id' => $product->id,
            'quantity'   => 5,
        ]);

        $product->recalculateStock();

        $this->assertEquals(15, $product->fresh()->current_stock);
    }

    public function test_recalculate_stock_never_goes_below_zero(): void
    {
        $product = Product::factory()->create(['current_stock' => 0]);

        StockOut::factory()->create([
            'product_id' => $product->id,
            'quantity'   => 99,
        ]);

        $product->recalculateStock();

        $this->assertEquals(0, $product->fresh()->current_stock);
    }

    public function test_soft_delete(): void
    {
        $product = Product::factory()->create();

        $product->delete();

        $this->assertSoftDeleted($product);
    }

    public function test_vespa_compatibility_is_cast_to_array(): void
    {
        $product = Product::factory()->create([
            'vespa_compatibility' => ['Sprint S', 'Universal'],
        ]);

        $this->assertIsArray($product->vespa_compatibility);
        $this->assertCount(2, $product->vespa_compatibility);
    }
}
