<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockIn;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockInFactory extends Factory
{
    protected $model = StockIn::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id'    => User::factory(),
            'quantity'   => fake()->numberBetween(1, 50),
            'modal_price' => fake()->numberBetween(50000, 500000),
            'category'   => fake()->randomElement(['pembelian_stok', 'produksi']),
            'date'       => fake()->date(),
            'notes'      => fake()->optional()->sentence(),
        ];
    }
}
