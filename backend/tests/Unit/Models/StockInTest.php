<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockInTest extends TestCase
{
    use RefreshDatabase;

    public function test_belongs_to_product(): void
    {
        $product = Product::factory()->create();
        $stockIn = StockIn::factory()->create(['product_id' => $product->id]);

        $this->assertTrue($stockIn->product->is($product));
    }

    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $stockIn = StockIn::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($stockIn->user->is($user));
    }

    public function test_total_modal_is_quantity_times_modal_price(): void
    {
        $stockIn = StockIn::factory()->make([
            'quantity'    => 10,
            'modal_price' => 50000,
        ]);

        $this->assertEquals(500000, $stockIn->total_modal);
    }

    public function test_date_is_cast_to_date_instance(): void
    {
        $stockIn = StockIn::factory()->create(['date' => '2024-06-15']);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $stockIn->date);
        $this->assertEquals('2024-06-15', $stockIn->date->format('Y-m-d'));
    }
}
