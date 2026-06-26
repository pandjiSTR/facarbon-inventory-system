<?php

declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class SecurityLogger
{
    public static function log(string $event, array $context = []): void
    {
        Log::channel('security')->warning($event, array_merge([
            'user_id'    => Auth::id(),
            'ip'         => Request::ip(),
            'user_agent' => Request::userAgent(),
            'url'        => Request::fullUrl(),
            'timestamp'  => now()->toIso8601String(),
        ], $context));
    }
}
