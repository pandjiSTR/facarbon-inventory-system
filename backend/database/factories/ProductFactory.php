<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        static $skuCounter = 0;
        $skuCounter++;

        return [
            'sku'                 => 'FAC-' . str_pad((string) $skuCounter, 3, '0', STR_PAD_LEFT),
            'name'                => fake()->unique()->words(3, true),
            'carbon_type'         => fake()->randomElement(['forged', 'twill']),
            'vespa_compatibility' => [fake()->randomElement(['Sprint S', 'Universal', 'LX', 'S Facelift'])],
            'modal_price'         => fake()->numberBetween(50000, 500000),
            'reseller_price'      => fn (array $attrs) => $attrs['modal_price'] + fake()->numberBetween(10000, 100000),
            'online_price'        => fn (array $attrs) => $attrs['reseller_price'] + fake()->numberBetween(5000, 50000),
            'current_stock'       => 0,
            'is_active'           => true,
        ];
    }
}
