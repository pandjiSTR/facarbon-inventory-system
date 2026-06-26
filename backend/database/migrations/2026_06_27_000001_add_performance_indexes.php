<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->index(['product_id', 'date'], 'stock_in_product_date_idx');
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->index(['product_id', 'date'], 'stock_out_product_date_idx');
            $table->index(['date', 'channel'], 'stock_out_date_channel_idx');
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->index(['type', 'category', 'date'], 'finances_type_cat_date_idx');
            $table->index(['date', 'type'], 'finances_date_type_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['date', 'status'], 'invoices_date_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->dropIndex('stock_in_product_date_idx');
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->dropIndex('stock_out_product_date_idx');
            $table->dropIndex('stock_out_date_channel_idx');
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->dropIndex('finances_type_cat_date_idx');
            $table->dropIndex('finances_date_type_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_date_status_idx');
        });
    }
};
