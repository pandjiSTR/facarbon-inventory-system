<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 20)->unique()->comment('Kode produk, contoh: FAC-001');
            $table->string('name');
            $table->enum('carbon_type', ['forged', 'twill'])->comment('Jenis carbon');
            
            // 💡 TRIK KHUSUS: Deteksi jenis database pas pembuatan tabel awal
            if (Schema::getConnection()->getDriverName() === 'pgsql') {
                // Jika di Render (PostgreSQL), buat kolomnya langsung dengan tipe jsonb biar ga error di kemudian hari
                $table->jsonb('vespa_compatibility')->comment('Kompatibilitas tipe Vespa, contoh: Sprint S, Universal');
            } else {
                // Jika di lokal laptop lu (MySQL), tetap berjalan sebagai string biasa bawaan project lama lu
                $table->string('vespa_compatibility')->comment('Kompatibilitas tipe Vespa, contoh: Sprint S, Universal');
            }

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
            $table->index('is_active');
            $table->index('current_stock');
            
            // 💡 FIX: Daftarkan index di semua jenis database (MySQL & PostgreSQL)
            // Biar kalau ada migration alter lain yang mau nge-drop index ini, PostgreSQL di Render ga ngamuk lagi.
            $table->index('vespa_compatibility');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};