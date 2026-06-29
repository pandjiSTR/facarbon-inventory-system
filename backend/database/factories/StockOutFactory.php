<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockOutFactory extends Factory
{
    protected $model = StockOut::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id'    => User::factory(),
            'quantity'   => fake()->numberBetween(1, 20),
            'channel'    => fake()->randomElement(['reseller', 'online', 'langsung']),
            'sell_price' => fake()->numberBetween(100000, 600000),
            'date'       => fake()->date(),
            'notes'      => fake()->optional()->sentence(),
        ];
    }
}
