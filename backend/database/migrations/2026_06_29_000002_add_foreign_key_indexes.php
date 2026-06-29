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
            $table->index('user_id', 'stock_in_user_id_idx');
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->index('user_id', 'stock_out_user_id_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('user_id', 'invoices_user_id_idx');
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->index('user_id', 'finances_user_id_idx');
        });
    }

    public function down(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->dropIndex('stock_in_user_id_idx');
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->dropIndex('stock_out_user_id_idx');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_user_id_idx');
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->dropIndex('finances_user_id_idx');
        });
    }
};
