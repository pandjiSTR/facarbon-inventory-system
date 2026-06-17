<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_out', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete();
            $table->foreignId('user_id')
                  ->constrained('users');
            $table->unsignedInteger('quantity');
            $table->enum('channel', ['reseller', 'online', 'langsung']);
            $table->unsignedBigInteger('sell_price');
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('product_id');
            $table->index('channel');
            $table->index('date');
            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_out');
    }
};