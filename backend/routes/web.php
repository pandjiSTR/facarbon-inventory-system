<?php

use Illuminate\Support\Facades\Route;

// Health check & info endpoint
Route::get('/', function () {
    return response()->json([
        'app'     => config('app.name'),
        'version' => '1.0.0',
        'status'  => 'running',
    ]);
});
