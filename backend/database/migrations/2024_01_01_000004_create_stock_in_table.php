<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_in', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete()
                  ->comment('Produk yang masuk');
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->comment('User yang input stok masuk');
            $table->unsignedInteger('quantity')->comment('Jumlah unit masuk');
            $table->unsignedBigInteger('modal_price')->comment('Harga modal per unit saat stok masuk (bisa berbeda dari products.modal_price)');
            $table->enum('category', ['pembelian_stok', 'produksi'])
                  ->default('produksi')
                  ->comment('pembelian_stok = beli jadi, produksi = buat sendiri');
            $table->date('date')->comment('Tanggal stok masuk');
            $table->text('notes')->nullable()->comment('Catatan tambahan');
            $table->timestamps();

            $table->index('product_id');
            $table->index('date');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_in');
    }
};
