<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiters();
        $this->validateEnvironment();
        $this->forceHttpsInProduction();
    }

    private function configureRateLimiters(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip());
        });

        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }

    private function validateEnvironment(): void
    {
        if (App::runningInConsole()) {
            return;
        }

        $required = ['app.key'];

        if (App::environment('production')) {
            $required[] = 'database.connections.mysql.database';
            $required[] = 'database.connections.mysql.username';
        }

        foreach ($required as $key) {
            if (empty(Config::get($key))) {
                throw new \RuntimeException("Missing required config key: {$key}");
            }
        }
    }

    private function forceHttpsInProduction(): void
    {
        if (App::environment('production')) {
            URL::forceScheme('https');
            request()->server->set('HTTPS', 'on');
        }
    }
}
