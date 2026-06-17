# Facarbon Inventory System — Setup Guide

## Prerequisites
- Laragon (PHP 8.2+, MySQL 8, Composer)
- Node.js 18+ (untuk React frontend)

---

## Langkah Setup (Backend Laravel 11)

### 1. Clone / Copy project ke folder Laragon
```bash
# Taruh project di:
C:\laragon\www\facarbon-api
```

### 2. Install dependencies
```bash
composer install
```

### 3. Copy & konfigurasi .env
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`, sesuaikan:
```
DB_DATABASE=facarbon_db
DB_USERNAME=root
DB_PASSWORD=        # kosong di Laragon default
```

### 4. Buat database
Buka phpMyAdmin atau Laragon terminal:
```sql
CREATE DATABASE facarbon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Jalankan migrasi + seeder
```bash
php artisan migrate --seed
```

### 6. Storage link (untuk foto produk)
```bash
php artisan storage:link
```

### 7. Jalankan development server
```bash
php artisan serve
# API tersedia di: http://localhost:8000/api/
```

---

## Struktur API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /api/auth/login | Login, dapat token Sanctum |
| POST | /api/auth/logout | Logout (hapus token) |
| GET | /api/auth/me | Info user yang login |
| GET | /api/dashboard | Ringkasan stok & keuangan |
| GET/POST | /api/products | List & tambah produk |
| GET/PATCH/DELETE | /api/products/{id} | Detail, edit, hapus produk |
| PATCH | /api/products/{id}/toggle-active | Aktif/nonaktifkan produk |
| GET | /api/products/{id}/stock-history | Riwayat stok produk |
| GET/POST | /api/stock-in | List & catat stok masuk |
| GET/DELETE | /api/stock-in/{id} | Detail & hapus stok masuk |
| GET/POST | /api/stock-out | List & catat stok keluar |
| GET/DELETE | /api/stock-out/{id} | Detail & hapus stok keluar |
| GET/POST | /api/finances | List & tambah catatan keuangan |
| GET | /api/finances/summary | Ringkasan pemasukan/pengeluaran |
| GET/POST | /api/invoices | List & buat invoice |
| GET/DELETE | /api/invoices/{id} | Detail & hapus invoice |

---

## Authentication

Gunakan **Bearer Token** dari Sanctum:

```http
Authorization: Bearer {token_dari_login}
Content-Type: application/json
Accept: application/json
```

---

## Default User (dari Seeder)

```
Email    : admin@facarbon.com
Password : facarbon123
Role     : admin
```
