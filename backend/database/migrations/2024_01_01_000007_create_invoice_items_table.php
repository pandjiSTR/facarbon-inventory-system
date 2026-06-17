<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                  ->constrained('invoices')
                  ->cascadeOnDelete()
                  ->comment('Invoice induk');
            $table->foreignId('product_id')
                  ->nullable()
                  ->constrained('products')
                  ->nullOnDelete()
                  ->comment('Produk (nullable: kalau produk dihapus, item tetap ada dengan snapshot nama)');
            $table->string('product_name')->comment('Snapshot nama produk saat invoice dibuat');
            $table->string('product_sku', 20)->nullable()->comment('Snapshot SKU produk');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price')->comment('Harga per unit saat transaksi');
            $table->unsignedBigInteger('subtotal')->comment('quantity × unit_price');
            $table->timestamps();

            $table->index('invoice_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
