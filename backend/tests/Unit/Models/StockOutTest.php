<?php

namespace Tests\Unit\Models;

use App\Models\Product;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockOutTest extends TestCase
{
    use RefreshDatabase;

    public function test_belongs_to_product(): void
    {
        $product = Product::factory()->create();
        $stockOut = StockOut::factory()->create(['product_id' => $product->id]);

        $this->assertTrue($stockOut->product->is($product));
    }

    public function test_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $stockOut = StockOut::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($stockOut->user->is($user));
    }

    public function test_total_revenue_is_quantity_times_sell_price(): void
    {
        $stockOut = StockOut::factory()->make([
            'quantity'   => 5,
            'sell_price' => 150000,
        ]);

        $this->assertEquals(750000, $stockOut->total_revenue);
    }

    public function test_date_is_cast_to_date_instance(): void
    {
        $stockOut = StockOut::factory()->create(['date' => '2024-06-15']);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $stockOut->date);
        $this->assertEquals('2024-06-15', $stockOut->date->format('Y-m-d'));
    }
}
