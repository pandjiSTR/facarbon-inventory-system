<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 30)->unique()->comment('Nomor invoice, contoh: INV/2024/001');
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->comment('User yang buat invoice');
            $table->string('buyer_name')->comment('Nama pembeli/reseller');
            $table->string('buyer_contact')->nullable()->comment('No HP / WA pembeli');
            $table->date('date')->comment('Tanggal invoice');
            $table->unsignedBigInteger('total_amount')->comment('Total nilai invoice (Rp)');
            $table->enum('status', ['draft', 'confirmed', 'paid'])
                  ->default('confirmed')
                  ->comment('Status pembayaran invoice');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('date');
            $table->index('status');
            $table->index('buyer_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
