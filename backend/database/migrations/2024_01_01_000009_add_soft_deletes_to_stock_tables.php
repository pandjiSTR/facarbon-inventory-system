<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('stock_out', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('finances', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
