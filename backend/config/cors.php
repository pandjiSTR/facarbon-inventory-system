<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://facarbon-inventory-system.vercel.app', // 💡 Domain Production Vercel (Utama)
        'https://facarbon-inventory-system-r8c5sz74h-uletbulujawa.vercel.app',
        'http://localhost:5173',                  // Lokal Vite
        'http://127.0.0.1:5173',
        'http://localhost:3000',                  // Lokal React biasa/Next.js
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // 💡 Diubah ke false karena frontend Facarbon menggunakan Bearer Token di localStorage, bukan cookie bawaan browser.
    'supports_credentials' => false,

];