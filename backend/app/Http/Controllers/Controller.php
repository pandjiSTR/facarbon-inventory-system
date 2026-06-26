<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;

abstract class Controller
{
    protected function forgetDashboardCache(string $date = null): void
    {
        $d = $date ? now()->parse($date) : now();
        Cache::forget("dashboard_{$d->year}_{$d->month}");
    }
}
