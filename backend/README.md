# Facarbon Inventory System — Backend (Laravel 13 API)

REST API untuk FIS, dibangun dengan Laravel 13 + Sanctum + MySQL 8.

## Tech

- **Laravel 13** — REST API service
- **Laravel Sanctum** — Token-based auth (24h expiry, single session)
- **MySQL 8.0** — Relational database
- **Maatwebsite/Laravel-Excel 3.1** — Excel import/export
- **PHPUnit 12** — 105 feature + unit tests (SQLite in-memory)

## Routes

42 functional endpoints across 9 controllers. Lihat `routes/api.php` untuk detail.

## Commands

```bash
composer install
cp .env.example .env          # sesuaikan DB credentials
php artisan key:generate
php artisan migrate --seed    # 2 users + 24 products
php artisan serve             # http://127.0.0.1:8000
php artisan test              # 105 tests
./vendor/bin/pint             # code style fix (PSR-12)
composer audit                # check deps for CVEs
```

## Seed Accounts

| Email | Password |
|-------|----------|
| admin@facarbon.com | facarbon123 |
| staff@facarbon.com | facarbon123 |

> Proyek ini bagian dari monorepo FIS. Lihat `../README.md` untuk dokumentasi lengkap.
