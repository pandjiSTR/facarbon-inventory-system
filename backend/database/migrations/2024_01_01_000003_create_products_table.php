<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 20)->unique()->comment('Kode produk, contoh: FAC-001');
            $table->string('name');
            $table->enum('carbon_type', ['forged', 'twill'])->comment('Jenis carbon');
            $table->string('vespa_compatibility')->comment('Kompatibilitas tipe Vespa, contoh: Sprint S, Universal');
            $table->unsignedBigInteger('modal_price')->comment('Harga modal/produksi (Rp)');
            $table->unsignedBigInteger('reseller_price')->comment('Harga jual reseller (Rp)');
            $table->unsignedBigInteger('online_price')->nullable()->comment('Harga jual online/marketplace (Rp), nullable jika belum ada');
            $table->integer('current_stock')->default(0)->comment('Stok saat ini = total stock_in - total stock_out');
            $table->string('photo')->nullable()->comment('Path foto produk di storage/app/public/products/');
            $table->boolean('is_active')->default(true)->comment('Produk aktif/tidak dijual');
            $table->timestamps();
            $table->softDeletes();

            // Index untuk query yang sering dipakai
            $table->index('carbon_type');
            $table->index('vespa_compatibility');
            $table->index('is_active');
            $table->index('current_stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
