<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    */
    'default' => env('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    */
    'connections' => [

        // Koneksi MySQL (Tetap aman dipakai buat ngoding di lokal laptop lu)
        'mysql' => [
            'driver'         => 'mysql',
            'url'            => env('DB_URL'),
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '3306'),
            'database'       => env('DB_DATABASE', 'facarbon_db'),
            'username'       => env('DB_USERNAME', 'root'),
            'password'       => env('DB_PASSWORD', ''),
            'unix_socket'    => env('DB_SOCKET', ''),
            'charset'        => env('DB_CHARSET', 'utf8mb4'),
            'collation'      => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix'         => '',
            'prefix_indexes' => true,
            'strict'         => true,
            'engine'         => null,
            'options'        => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // 💡 KONEKSI POSTGRESQL (Wajib ada biar nembak database cloud Render lancar)
        'pgsql' => [
            'driver'         => 'pgsql',
            'url'            => env('DATABASE_URL'), // Membaca URL penuh dari Render
            'host'           => env('DB_HOST', '127.0.0.1'),
            'port'           => env('DB_PORT', '5432'),
            'database'       => env('DB_DATABASE', 'laravel'),
            'username'       => env('DB_USERNAME', 'root'),
            'password'       => env('DB_PASSWORD', ''),
            'charset'        => env('DB_CHARSET', 'utf8'),
            'prefix'         => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'        => 'prefer',
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    */
    'migrations' => [
        'table'  => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    */
    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),
        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix'  => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
        ],
        'default' => [
            'url'      => env('REDIS_URL'),
            'host'     => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port'     => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
    ],

];