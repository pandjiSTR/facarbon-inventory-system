<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Konversi data lama ke JSON array dulu
        $products = DB::table('products')->get();
        foreach ($products as $product) {
            $current = $product->vespa_compatibility;
            $decoded = json_decode($current, true);
            if (!is_array($decoded)) {
                DB::table('products')->where('id', $product->id)->update([
                    'vespa_compatibility' => json_encode([$current]),
                ]);
            }
        }

        Schema::table('products', function (Blueprint $table) {
            // Drop index dulu
            $table->dropIndex('products_vespa_compatibility_index');
            // Ubah kolom ke json
            $table->json('vespa_compatibility')->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('vespa_compatibility')->change();
            $table->index('vespa_compatibility');
        });
    }
};