<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->comment('User yang input / trigger otomatis');

            // Relasi ke stock_in atau stock_out (nullable — bisa juga entry manual)
            $table->foreignId('stock_in_id')
                  ->nullable()
                  ->constrained('stock_in')
                  ->nullOnDelete()
                  ->comment('Referensi stok masuk jika otomatis');
            $table->foreignId('stock_out_id')
                  ->nullable()
                  ->constrained('stock_out')
                  ->nullOnDelete()
                  ->comment('Referensi stok keluar jika otomatis');

            $table->date('date')->comment('Tanggal transaksi keuangan');
            $table->string('description')->comment('Deskripsi singkat transaksi');

            $table->enum('category', [
                'pembelian_stok',   // debit: beli bahan/produk jadi
                'produksi',         // debit: biaya produksi carbon
                'penjualan',        // kredit: hasil penjualan
                'operasional',      // debit: biaya operasional (ongkir, dll)
                'lain_lain',        // debit/kredit: transaksi lainnya
            ])->comment('Kategori transaksi keuangan');

            $table->enum('type', ['debit', 'kredit'])
                  ->comment('debit = uang keluar / pengeluaran, kredit = uang masuk / pemasukan');

            $table->unsignedBigInteger('amount')->comment('Nominal transaksi (Rp)');
            $table->text('notes')->nullable()->comment('Catatan tambahan');
            $table->timestamps();

            $table->index('date');
            $table->index('category');
            $table->index('type');
            $table->index('stock_in_id');
            $table->index('stock_out_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finances');
    }
};
