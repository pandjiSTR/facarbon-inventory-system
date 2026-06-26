# FIS — Facarbon Inventory System
## Resource Document untuk Laporan & Jurnal

> **Dokumen ini berisi dokumentasi teknis lengkap proyek Facarbon Inventory System (FIS),**
> mencakup arsitektur, implementasi, database, API, frontend, deployment, dan seluruh
> keputusan teknis yang dibuat selama pengembangan.
>
> **Versi:** 1.0 — 27 Juni 2026
> **Repo:** https://github.com/pandjiSTR/facarbon-inventory-system
> **Live URL:** https://facarbon-inventory-system.vercel.app
> **API URL:** https://facarbon-backend.onrender.com

---

## Daftar Isi

1. [Identitas & Latar Belakang](#1-identitas--latar-belakang)
2. [Tim Pengembang](#2-tim-pengembang)
3. [Tech Stack & Versi](#3-tech-stack--versi)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Design System & Theming](#5-design-system--theming)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Business Rules](#8-business-rules)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Frontend Pages & Components](#10-frontend-pages--components)
11. [Backend Architecture](#11-backend-architecture)
12. [State Management](#12-state-management)
13. [Key Implementation Details](#13-key-implementation-details)
14. [Testing Strategy](#14-testing-strategy)
15. [Deployment](#15-deployment)
16. [Version Control History](#16-version-control-history)
17. [Optimization & Performance](#17-optimization--performance)
18. [Security Measures](#18-security-measures)
19. [Development Workflow](#19-development-workflow)
20. [Known Issues & Limitations](#20-known-issues--limitations)

---

## 1. Identitas & Latar Belakang

### 1.1 Identitas Proyek

| Item | Detail |
|---|---|
| Nama Aplikasi | Facarbon Inventory System (FIS) |
| Tipe Aplikasi | Web-based Inventory & Financial Management System |
| Platform | Web (desktop-first, mobile-friendly) |
| Tahun Pengembangan | 2026 |
| Status | Production (live) |
| Lisensi | Proprietary — akademik |

### 1.2 Latar Belakang

Facarbon adalah usaha mikro yang menjual aksesoris dan part Vespa matic berbahan carbon fiber (forged & twill carbon). Sebelum adanya FIS, seluruh pencatatan stok dan keuangan dilakukan secara manual menggunakan Microsoft Excel. Pendekatan manual ini menimbulkan beberapa permasalahan:

1. **Tidak ada notifikasi stok kosong** — kehabisan stok baru diketahui saat ada pesanan
2. **Rawan human error** — kesalahan input manual sering terjadi
3. **Pencatatan terpisah** — data stok dan keuangan tidak terintegrasi
4. **Tidak ada analitik** — tidak ada dashboard atau grafik untuk pengambilan keputusan
5. **Akses terbatas** — hanya bisa diakses oleh satu orang dalam satu waktu

FIS dikembangkan dalam konteks **tugas kuliah** dengan studi kasus usaha nyata, untuk menggantikan sistem pencatatan manual Excel dengan sistem informasi terstruktur yang menyediakan:

- Manajemen produk dan stok terintegrasi
- Pencatatan keuangan otomatis dari setiap transaksi stok
- Pembuatan faktur penjualan multi-item
- Dashboard analitik real-time
- Kemampuan import data historis dari Excel
- Dark/light theme

### 1.3 Tujuan Akademik

Dari sisi akademik, proyek FIS bertujuan untuk:

1. Mengimplementasikan **sistem informasi inventori** dengan metodologi pengembangan perangkat lunak terstruktur
2. Menerapkan **arsitektur REST API** menggunakan Laravel sebagai backend
3. Mengembangkan **Single Page Application (SPA)** modern dengan React 19
4. Mengintegrasikan **database relasional** MySQL dengan skema yang ternormalisasi
5. Mendemonstrasikan **deployment** aplikasi ke platform cloud
6. Menerapkan **pola-pola pengembangan** seperti code splitting, server-side pagination, caching, dan rate limiting

---

## 2. Tim Pengembang

| Nama | NIM | Role Utama | GitHub |
|---|---|---|---|
| **Mohammad Panji Satrio** | 13240019 | Backend Developer, Integrator, DevOps | [@pandjiSTR](https://github.com/pandjiSTR) |
| **Anaya Bintang Prawidya** | 13240011 | Frontend Developer, UI/UX Designer | [@fleurdes0ir](https://github.com/fleurdes0ir) |

**Pembagian Kerja:**

| Area | Panji | Anaya |
|---|---|---|
| Backend API (Laravel) | ✅ Primary | — |
| Database Schema & Migration | ✅ Primary | — |
| Authentication (Sanctum) | ✅ Primary | ✅ Review |
| Frontend React Pages | ✅ Co-Develop | ✅ Co-Develop |
| UI Design System & CSS | — | ✅ Primary |
| Deployment (Vercel, Render, Docker) | ✅ Primary | — |
| Testing (PHPUnit) | ✅ Primary | — |
| Import Excel | ✅ Primary | — |
| Business Rules & Logic | ✅ Primary | ✅ Review |

---

## 3. Tech Stack & Versi

### 3.1 Backend

| Teknologi | Versi | Fungsi |
|---|---|---|
| **PHP** | 8.3+ | Runtime language |
| **Laravel Framework** | 13.x | Full-stack framework (digunakan sebagai REST API) |
| **Laravel Sanctum** | 4.3+ | Token-based authentication API |
| **Laravel Pint** | 1.13+ | PHP code style fixer (PSR-12) |
| **Maatwebsite/Laravel-Excel** | 3.1+ | Excel file import/export |
| **PHPUnit** | 12.x | Unit & feature testing |
| **FakerPHP** | 1.23+ | Test data generation |
| **Laravel Tinker** | 3.0+ | REPL interactive |

### 3.2 Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| **React** | 19.2.6 | UI library |
| **React Router** | 7.17.0 | Client-side routing + code splitting |
| **Vite** | 8.0.12 | Build tool & dev server |
| **TailwindCSS** | 4.3.1 | Utility-first CSS (via Vite plugin) |
| **Axios** | 1.18.0 | HTTP client |
| **Recharts** | 3.8.1 | Charting library (BarChart, LineChart, PieChart) |
| **Lucide React** | 1.18.0 | SVG icon library |
| **React-to-Print** | 3.3.0 | Invoice printing |
| **ESLint** | 10.x | JavaScript linting |
| **@tailwindcss/vite** | 4.3.1 | Tailwind Vite integration |

### 3.3 Infrastructure

| Teknologi | Fungsi |
|---|---|
| **MySQL 8.0** | Database production |
| **Laragon** | Local development environment (Apache/Nginx optional) |
| **Cloudflare Tunnel** | Local dev sharing via internet |
| **Vercel** | Frontend hosting & auto-deploy |
| **Render** | Backend API hosting + MySQL database |
| **Docker** | Containerization (opsional alternatif deploy) |
| **GitHub Actions** | CI/CD workflows (sebelum dihapus) |

### 3.4 Dependencies Lengkap

**Backend (`composer.json`):**
```json
{
    "require": {
        "php": "^8.2",
        "laravel/framework": "^13.0",
        "laravel/sanctum": "^4.3",
        "laravel/tinker": "^3.0",
        "maatwebsite/excel": "^3.1"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pint": "^1.13",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.0",
        "phpunit/phpunit": "^12.0"
    }
}
```

**Frontend (`package.json`):**
```json
{
    "dependencies": {
        "@tailwindcss/vite": "^4.3.1",
        "axios": "^1.18.0",
        "lucide-react": "^1.18.0",
        "react": "^19.2.6",
        "react-dom": "^19.2.6",
        "react-router-dom": "^7.17.0",
        "react-to-print": "^3.3.0",
        "recharts": "^3.8.1",
        "tailwindcss": "^4.3.1"
    },
    "devDependencies": {
        "@eslint/js": "^10.0.1",
        "@types/react": "^19.2.14",
        "@types/react-dom": "^19.2.3",
        "@vitejs/plugin-react": "^6.0.1",
        "eslint": "^10.3.0",
        "eslint-plugin-react-hooks": "^7.1.1",
        "eslint-plugin-react-refresh": "^0.5.2",
        "globals": "^17.6.0",
        "vite": "^8.0.12"
    }
}
```

---

## 4. Arsitektur Sistem

### 4.1 Arsitektur Umum

FIS menggunakan arsitektur **Client-Server** dengan **REST API** arsitektur:

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────┐
│                     │  HTTPS  │                     │  MySQL  │             │
│  React SPA          │◄═══════►│  Laravel REST API   │◄═══════►│  MySQL 8    │
│  (Vercel)           │ Bearer  │  (Render)           │         │  (Render)   │
│                     │ Token   │                     │         │             │
└─────────────────────┘         └─────────────────────┘         └─────────────┘
       ◄── Frontend ──►              ◄── Backend ──►               ◄── DB ──►
```

**Spesifikasi Arsitektur:**
- **Frontend:** Single Page Application (SPA) menggunakan React 19, di-render di browser client
- **Backend:** REST API service menggunakan Laravel 13, tanpa Blade/Breeze/Jetstream
- **Database:** MySQL 8.0, diakses melalui Eloquent ORM
- **Komunikasi:** HTTPS dengan JSON payload, Bearer token via Sanctum
- **CORS:** Frontend dan backend di domain terpisah (Vercel vs Render), CORS dikonfigurasi secara eksplisit

### 4.2 Struktur Monorepo

```
facarbon-inventory-system/
│
├── backend/                          ← Laravel 13 REST API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Controller.php               ← Base: forgetDashboardCache()
│   │   │   └── Api/
│   │   │       ├── AuthController.php        ← Login, logout, me
│   │   │       ├── DashboardController.php   ← Cache::remember() 5 menit
│   │   │       ├── ProductController.php     ← CRUD + toggle + export + pagination
│   │   │       ├── StockInController.php     ← Create + delete (no update) + export
│   │   │       ├── StockOutController.php    ← Create + delete (no update) + export
│   │   │       ├── FinanceController.php     ← Manual entry + export + summary
│   │   │       ├── InvoiceController.php     ← Multi-item invoice (no update)
│   │   │       ├── UserController.php        ← Admin CRUD user
│   │   │       └── ImportController.php      ← Excel import (2-step: preview→confirm)
│   │   ├── Middleware/
│   │   │   └── SecurityHeaders.php           ← CSP, X-Frame-Options, dll.
│   │   ├── Models/
│   │   │   ├── User.php                     ← HasApiTokens, HasFactory
│   │   │   ├── Product.php                  ← SoftDeletes, recalculateStock()
│   │   │   ├── StockIn.php                  ← Hard delete (SoftDeletes removed)
│   │   │   ├── StockOut.php                 ← Hard delete (SoftDeletes removed)
│   │   │   ├── Finance.php                  ← Hard delete (SoftDeletes removed)
│   │   │   ├── Invoice.php                  ← SoftDeletes, generateNumber()
│   │   │   └── InvoiceItem.php              ← Auto subtotal on saving
│   │   ├── Imports/
│   │   │   ├── FinanceImport.php            ← Fuzzy matching + multi-format date
│   │   │   ├── StockInImport.php            ← Fuzzy matching product
│   │   │   ├── StockOutImport.php           ← Fuzzy matching product
│   │   │   └── ProductImport.php            ← --
│   │   ├── Helpers/
│   │   │   └── SecurityLogger.php           ← Log aktivitas sensitif ke channel 'security'
│   │   └── Providers/
│   │       └── AppServiceProvider.php       ← Rate limiters, env validation, HTTPS force
│   ├── config/
│   │   ├── cors.php                         ← Vercel + local domains
│   │   ├── sanctum.php                      ← Expiry 24 jam
│   │   └── excel.php
│   ├── database/
│   │   ├── factories/
│   │   │   └── ProductFactory.php           ← Auto SKU FAC-XXX increment
│   │   ├── migrations/                      ← 14 file migrasi
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── UserSeeder.php               ← 2 user: admin + staff
│   │       └── ProductSeeder.php            ← 24 produk FAC-001 s/d FAC-024
│   ├── routes/
│   │   └── api.php                          ← 42 endpoint
│   ├── tests/
│   │   └── Feature/Api/
│   │       ├── AuthTest.php                 ← 6 tests
│   │       ├── ProductApiTest.php           ← 6 tests
│   │       ├── StockInApiTest.php           ← 3 tests
│   │       ├── StockOutApiTest.php          ← 3 tests
│   │       ├── FinanceApiTest.php           ← 10 tests
│   │       ├── InvoiceApiTest.php           ← 4 tests
│   │       └── ImportApiTest.php            ← 10 tests
│   ├── .env.example
│   ├── composer.json
│   └── render.yaml                         ← (opsional, root punya sendiri)
│
├── frontend/                         ← React 19 + Vite 8 + TailwindCSS 4
│   ├── src/
│   │   ├── pages/                            ← 12 halaman, semua React.lazy
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── import/
│   │   │   │   ├── Dropzone.jsx
│   │   │   │   ├── ImportFinanceTab.jsx
│   │   │   │   ├── ImportStockInTab.jsx
│   │   │   │   ├── ImportStockOutTab.jsx
│   │   │   │   └── ResultBanner.jsx
│   │   │   └── ui/
│   │   │       ├── StatCard.jsx
│   │   │       ├── Badge.jsx                 ← Carbon type badge
│   │   │       ├── StockBadge.jsx            ← Stok warna (hijau/merah)
│   │   │       ├── ProductCard.jsx           ← Catalog mode card
│   │   │       ├── ProductDetailDrawer.jsx   ← Slide drawer detail
│   │   │       ├── ImageModal.jsx
│   │   │       ├── ImageTooltip.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       ├── LoadingSkeleton.jsx       ← Card/Table/Chart skeleton
│   │   │       ├── Pagination.jsx            ← Reusable pagination
│   │   │       └── ConfirmDialog.jsx         ← Ganti window.confirm()
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── ToastContext.jsx
│   │   │   ├── useAuth.js                    ← Hook terpisah
│   │   │   ├── useTheme.js                   ← Hook terpisah
│   │   │   └── useToast.js                   ← Hook terpisah
│   │   ├── api/
│   │   │   └── axios.js                      ← Interceptor token + 401 redirect
│   │   ├── utils/
│   │   │   └── exportCSV.js                  ← Blob download helper
│   │   ├── assets/
│   │   │   ├── logo-facarbon-dark.png
│   │   │   └── logo-facarbon-white.png
│   │   ├── index.css                         ← CSS variables, theming, keyframes
│   │   ├── App.jsx                           ← Router + providers + code splitting
│   │   └── main.jsx                          ← Entry point
│   ├── e2e/
│   │   └── smoke.spec.js                     ← Playwright smoke test
│   ├── vercel.json
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── Dockerfile                                 ← Multi-stage build
├── docker-compose.yml                         ← mysql + backend + frontend
├── nginx.conf                                 ← SPA fallback + API proxy
├── render.yaml                                ← Backend deploy config
├── README.md
├── AGENTS.md                                  ← (gitignored — local AI context)
├── context.md                                 ← (gitignored — local AI context)
├── resource.md                                ← (file ini)
└── docs/
    ├── screenshots/
    └── SRS_FIS_Facarbon_v1.1.docx
```

### 4.3 Aliran Data Antar Modul

```
                     ┌──────────────────┐
                     │   Product        │
                     │   (CRUD)         │
                     └────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   StockIn     │    │   StockOut    │    │  Invoice      │
│  (masuk)      │    │  (keluar)     │    │  (faktur)     │
│  → qty +      │    │  → qty -     │    │  → items      │
│  → auto       │    │  → auto      │    │  → auto       │
│    finance    │    │    finance   │    │    stock_out  │
│    debit      │    │    kredit    │    │    + finance  │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                      │
        └────────────────────┴──────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Finance        │
                    │   (buku kas)     │
                    │   debit / kredit │
                    └──────────────────┘

    Setiap mutasi stok → update current_stock via recalculateStock()
    Setiap mutasi stok → create/delete record Finance
    Invoice → StockOut + Finance dalam 1 DB transaction
    Semua mutasi → invalidate dashboard cache
```

---

## 5. Design System & Theming

### 5.1 Filosofi Desain

FIS menggunakan **dark mode sebagai default** dengan aksen gold (`#c8a96e`) yang merepresentasikan identitas brand carbon fiber mewah. Light mode tersedia sebagai opsi. Warna stok menggunakan semantik hijau (tersedia) dan merah (kosong).

Semua styling menggunakan **inline styles** yang mereferensi **CSS custom properties** yang didefinisikan di `index.css`, bukan Tailwind utility classes langsung — untuk memudahkan theming global.

### 5.2 CSS Variables

**Dark Mode (default):**
```css
:root {
  --bg-main: #0d0d0d;        /* Darkest */
  --bg-surface: #111111;      /* Card */
  --bg-elevated: #161616;     /* Input, hover */
  --border: #1e1e1e;
  --border-active: #2a2a2a;
  --accent: #c8a96e;          /* Gold */
  --accent-dim: #a8894e;
  --accent-bg: rgba(200, 169, 110, 0.08);
  --red: #e05a5a;
  --red-bg: rgba(224, 90, 90, 0.08);
  --green: #5a9e5a;
  --green-bg: rgba(90, 158, 90, 0.08);
  --text-primary: #f0f0f0;
  --text-secondary: #888888;
  --text-muted: #444444;
  --sidebar-width: 220px;
  --shadow: 0 1px 3px rgba(0,0,0,0.4);
}
```

**Light Mode (toggle dengan class `.light` di `<html>`):**
```css
:root.light {
  --bg-main: #f4f4f5;
  --bg-surface: #ffffff;
  --bg-elevated: #f9f9f9;
  --border: #e4e4e7;
  --border-active: #d4d4d8;
  --accent: #b8894e;
  --accent-dim: #9a7040;
  --accent-bg: rgba(184, 137, 78, 0.08);
  --red: #dc2626;
  --red-bg: rgba(220, 38, 38, 0.06);
  --green: #16a34a;
  --green-bg: rgba(22, 163, 74, 0.06);
  --text-primary: #18181b;
  --text-secondary: #52525b;
  --text-muted: #a1a1aa;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

### 5.3 Tipografi

| Font | Penggunaan | Weight |
|---|---|---|
| **Inter** (sans-serif) | UI, navigasi, label, tombol, header | 300-700 |
| **DM Sans** (sans-serif) | Body, paragraf, form, deskripsi | 300-600 |
| **JetBrains Mono** (monospace) | Angka: harga, stok, SKU, invoice, kode | 400-600 |

Font di-load dari Google Fonts via `@import` di `index.css`.

### 5.4 Animasi (CSS Keyframes)

| Keyframe | Penggunaan |
|---|---|
| `fadeIn` | Page transitions (AppLayout — 0.25s ease-out) |
| `scaleIn` / `scaleOut` | Modal overlay |
| `slideDown` / `slideUp` | Toast notifications, drop-downs |
| `spin` | Loading spinner dalam tombol |
| `pulse` | Loading skeletons (CardSkeleton, TableSkeleton, ChartSkeleton) |

### 5.5 Komponen UI Pattern

Semua halaman menggunakan **inline styles** (`style={{}}`) berdasarkan CSS variables. Tidak ada penggunaan CSS modules, styled-components, atau utility classes Tailwind di level komponen (Tailwind hanya digunakan di `index.css` untuk import dan kelas utilitas global seperti `.card-hover`, `.font-ui`, `.font-body`, `.font-mono`).

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram (Relasi)

```
User ──hasMany──> StockIn ──belongsTo──> Product
User ──hasMany──> StockOut ──belongsTo──> Product
User ──hasMany──> Invoice ──hasMany──> InvoiceItem ──belongsTo──> Product
User ──hasMany──> Finance
                     ├──belongsTo──> StockIn (opsional, FK stock_in_id)
                     └──belongsTo──> StockOut (opsional, FK stock_out_id)
Invoice ──hasMany──> StockOut (opsional, FK invoice_id)
Product ──hasOne──> StockIn (FK product_id)
Product ──hasOne──> StockOut (FK product_id)
InvoiceItem ──belongsTo──> Product (opsional, SET NULL on delete)
```

### 6.2 Detail Tabel

#### `users` — Auth & Role

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| name | VARCHAR(255) | NOT NULL | Display name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login credential |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed |
| role | ENUM('admin','staff') | NOT NULL, DEFAULT 'staff' | Peran user |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Status aktif |
| remember_token | VARCHAR(100) | NULLABLE | Laravel remember me |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Relationships:** hasMany(StockIn, StockOut, Finance, Invoice)
**Factory:** `User::factory()` — default random name+email+password
**Seeder:** 2 user tercatat (lihat [Seed Data](#143-seed-data))
**Note:** Sanctum personal_access_tokens di tabel terpisah (morphMany)

#### `products` — Master Produk

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| sku | VARCHAR(20) | NOT NULL, UNIQUE | Format: FAC-XXX |
| name | VARCHAR(255) | NOT NULL | Nama produk |
| carbon_type | ENUM('forged','twill') | NOT NULL | Jenis carbon |
| vespa_compatibility | JSON | NOT NULL | Array model Vespa (cast to array) |
| modal_price | BIGINT UNSIGNED | NOT NULL | Harga modal per unit |
| reseller_price | BIGINT UNSIGNED | NOT NULL | Harga jual reseller |
| online_price | BIGINT UNSIGNED | NULLABLE | Harga jual online |
| current_stock | INTEGER | NOT NULL, DEFAULT 0 | Auto-calculate via recalculateStock() |
| photo | VARCHAR(255) | NULLABLE | Path foto produk |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Status aktif |
| deleted_at | TIMESTAMP | NULLABLE | SoftDeletes |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Casts:** `vespa_compatibility → array`, `is_active → boolean`, `current_stock → integer`
**Appended:** `photo_url` — full URL via `asset('storage/' . $this->photo)`
**Relationships:** hasMany(StockIn, StockOut, InvoiceItem)
**Indexes:** `sku` UNIQUE, `carbon_type`, `is_active`
**Note di Vespa:** Di seeder, `vespa_compatibility` disimpan sebagai string (bukan JSON array) — tetap berfungsi karena ada cast ke array

**`recalculateStock()` method:**
```php
public function recalculateStock(): void
{
    $this->current_stock = max(0,
        $this->stockIns()->sum('quantity') - $this->stockOuts()->sum('quantity')
    );
    $this->saveQuietly();  // saveQuietly() untuk hindari event loop
}
```

#### `stock_in` — Transaksi Stok Masuk

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| product_id | BIGINT UNSIGNED | FK → products, CASCADE | |
| user_id | BIGINT UNSIGNED | FK → users | Pencatat transaksi |
| quantity | INT UNSIGNED | NOT NULL | Jumlah stok masuk |
| modal_price | BIGINT UNSIGNED | NOT NULL | Harga modal per unit |
| category | ENUM('pembelian_stok','produksi') | NOT NULL | Kategori |
| date | DATE | NOT NULL | Tanggal transaksi |
| notes | TEXT | NULLABLE | Catatan |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Casts:** `quantity → integer`, `modal_price → integer`, `date → date`
**Relationships:** belongsTo(Product, User), hasOne(Finance via stock_in_id)
**Indexes:** `product_id`, `date`, `(product_id, date)`
**Note:** Hard delete — `deleted_at` tidak ada. `SoftDeletes` telah di-remove dari model karena kolom belum termigrasi di production.

#### `stock_out` — Transaksi Stok Keluar

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| product_id | BIGINT UNSIGNED | FK → products, CASCADE | |
| user_id | BIGINT UNSIGNED | FK → users | Pencatat transaksi |
| quantity | INT UNSIGNED | NOT NULL | Jumlah keluar |
| channel | ENUM('reseller','online','langsung') | NOT NULL | Channel penjualan |
| sell_price | BIGINT UNSIGNED | NOT NULL | Harga jual actual (bisa beda dari katalog) |
| invoice_id | BIGINT UNSIGNED | FK → invoices, SET NULL, NULLABLE | Terkait invoice? |
| date | DATE | NOT NULL | Tanggal transaksi |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Casts:** `quantity → integer`, `sell_price → integer`, `date → date`
**Relationships:** belongsTo(Product, User, Invoice), hasOne(Finance via stock_out_id)
**Indexes:** `product_id`, `date`, `channel`, `invoice_id`
**Note:** Hard delete — `SoftDeletes` telah di-remove.

#### `invoices` — Faktur Penjualan

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| invoice_number | VARCHAR(30) | NOT NULL, UNIQUE | Auto: INV/YYYY/NNN |
| user_id | BIGINT UNSIGNED | FK → users | Pembuat faktur |
| buyer_name | VARCHAR(255) | NOT NULL | Nama pembeli |
| buyer_contact | VARCHAR(255) | NULLABLE | Kontak pembeli |
| date | DATE | NOT NULL | Tanggal faktur |
| total_amount | BIGINT UNSIGNED | NOT NULL, DEFAULT 0 | Auto dari sum subtotal items |
| status | ENUM('draft','confirmed','paid') | NOT NULL, DEFAULT 'confirmed' | Status faktur |
| notes | TEXT | NULLABLE | |
| deleted_at | TIMESTAMP | NULLABLE | SoftDeletes |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Relationships:** belongsTo(User), hasMany(InvoiceItem, StockOut)
**Indexes:** `invoice_number` UNIQUE, `date`, `status`

**`generateNumber()` method:**
```php
public static function generateNumber(): string
{
    $year = now()->format('Y');
    $last = self::whereYear('created_at', $year)
        ->lockForUpdate()
        ->count();
    return sprintf('INV/%s/%03d', $year, $last + 1);
}
```

#### `invoice_items` — Item Faktur

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| invoice_id | BIGINT UNSIGNED | FK → invoices, CASCADE | |
| product_id | BIGINT UNSIGNED | FK → products, SET NULL, NULLABLE | Snapshot opsional |
| product_name | VARCHAR(255) | NOT NULL | Snapshot nama |
| product_sku | VARCHAR(20) | NULLABLE | Snapshot SKU |
| quantity | INT UNSIGNED | NOT NULL | |
| unit_price | BIGINT UNSIGNED | NOT NULL | Harga per unit |
| subtotal | BIGINT UNSIGNED | NOT NULL | Auto: quantity × unit_price |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Casts:** `quantity → integer`, `unit_price → integer`, `subtotal → integer`
**Relationships:** belongsTo(Invoice, Product)
**Note:** `subtotal` dihitung otomatis via `saving` event di `booted()`

#### `finances` — Buku Kas

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT UNSIGNED | PK, Auto Increment | |
| user_id | BIGINT UNSIGNED | FK → users | |
| stock_in_id | BIGINT UNSIGNED | FK → stock_in, SET NULL, NULLABLE | Auto-generated dari StockIn? |
| stock_out_id | BIGINT UNSIGNED | FK → stock_out, SET NULL, NULLABLE | Auto-generated dari StockOut? |
| date | DATE | NOT NULL | |
| description | VARCHAR(255) | NOT NULL | |
| category | ENUM('pembelian_stok','produksi','penjualan','operasional','lain_lain') | NOT NULL | |
| type | ENUM('debit','kredit') | NOT NULL | |
| amount | BIGINT UNSIGNED | NOT NULL | |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMP | NULLABLE | |
| updated_at | TIMESTAMP | NULLABLE | |

**Relationships:** belongsTo(User, StockIn, StockOut)
**Scopes:** `debit()`, `kredit()`, `byCategory()`, `byDateRange()`
**Note:** Hard delete — `SoftDeletes` telah di-remove.

#### `personal_access_tokens` — Sanctum Tokens

Tabel standar Laravel Sanctum untuk menyimpan token API. Menggunakan morphMany ke User.

### 6.3 Database Indexes

Migration `add_performance_indexes` menambahkan index komposit pada:

| Tabel | Index |
|---|---|
| stock_in | `idx_stock_in_product_date` (product_id, date) |
| stock_out | `idx_stock_out_product_date` (product_id, date) |
| invoices | `idx_invoices_date_status` (date, status) |
| finances | `idx_finances_date_type` (date, type) |

### 6.4 Semua Kolom BIGINT UNSIGNED untuk Uang

Semua harga dan jumlah uang disimpan sebagai `BIGINT UNSIGNED` (rupiah, tanpa desimal). Tidak pernah menggunakan float untuk menghindari masalah floating point precision.

---

## 7. API Endpoints

### 7.1 Ringkasan

Base URL: `http://127.0.0.1:8000/api` (local) / `https://facarbon-backend.onrender.com/api` (production)

| Kategori | Jumlah | Auth |
|---|---|---|
| Auth (public) | 2 | ❌ Tidak |
| Auth (protected) | 2 | ✅ Sanctum |
| Dashboard | 1 | ✅ Sanctum |
| Products | 8 | ✅ Sanctum |
| Stock In | 5 | ✅ Sanctum |
| Stock Out | 5 | ✅ Sanctum |
| Finances | 5 | ✅ Sanctum |
| Invoices | 4 | ✅ Sanctum |
| Users | 5 | ✅ Sanctum |
| Import Excel | 6 | ✅ Sanctum |
| **Total** | **42** | |

### 7.2 Response Shape

Semua endpoint mengembalikan response dengan format konsisten:

```json
{
    "success": true,
    "data": { ... },
    "message": "Produk berhasil ditambahkan",
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 25,
        "total": 105,
        "total_quantity": 1234,
        "total_modal": 50000000
    }
}
```

### 7.3 Endpoint Detail

#### Auth (2 public + 2 protected)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login dengan email+password → return user + Sanctum token |
| POST | `/auth/register` | ❌ | Register user baru (route ada, controller TIDAK implementasi — 404) |
| POST | `/auth/logout` | ✅ | Hapus token Sanctum yang sedang digunakan |
| GET | `/auth/me` | ✅ | Informasi user yang sedang login |

**Catatan:** `register` tidak diimplementasikan karena registrasi hanya via UserController (admin-only).

#### Dashboard (1 — cached 5 menit)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/dashboard` | ✅ | Statistik: cards, chart 6 bulan, alert stok, penjualan terbaru |

**Cache:** `Cache::remember("dashboard_{year}_{month}", 300, callback)` — TTL 5 menit.
**Invalidate:** Semua mutation endpoint (stock-in, stock-out, invoice, finance, product) via `Controller::forgetDashboardCache($date)`.

Response mencakup:
- `period`: bulan & tahun yang di-cache
- `products`: total_products, active_products, out_of_stock, low_stock
- `stock`: stock_in_qty, stock_out_qty
- `finances`: total_kredit, total_debit, laba_kotor
- `invoices`: count, total_amount
- `alerts`: out_of_stock_products (products dengan current_stock=0 dan is_active=true)
- `recent_sales`: 5 stock_out terakhir dengan info produk
- `monthly_chart`: array 6 bulan (label, masuk, keluar)

#### Products (8)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/products` | ✅ | List (paginate, filter: search, carbon_type, out_of_stock, is_active) |
| POST | `/products` | ✅ | Tambah (upload foto, validasi dimensions 100×100 – 4000×4000) |
| GET | `/products/{id}` | ✅ | Detail + 5 riwayat stok terakhir |
| PUT | `/products/{id}` | ✅ | Update (support remove_photo) |
| DELETE | `/products/{id}` | ✅ | Soft-delete (422 jika current_stock > 0) |
| PATCH | `/products/{id}/toggle-active` | ✅ | Toggle aktif/nonaktif |
| GET | `/products/{id}/stock-history` | ✅ | Semua riwayat stock-in & stock-out + aggregasi total_in/total_out |
| GET | `/products/export` | ✅ | Export CSV (StreamedResponse) |

**Filter:** `?search=` (name/SKU), `?carbon_type=` (forged/twill), `?out_of_stock=1`, `?is_active=1`
**Pagination:** `?per_page=` (default 25, max 100), `?page=`
**Sort:** `orderBy('sku')` ascending

#### Stock In (5 — No update)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/stock-in` | ✅ | List (paginate, filter: product_id, category, date_from, date_to) |
| POST | `/stock-in` | ✅ | Catat → update stok → auto finance debit → invalidate cache |
| GET | `/stock-in/{id}` | ✅ | Detail + user + product + finance |
| DELETE | `/stock-in/{id}` | ✅ | Hapus finance → hapus stock-in → recalculate stok → invalidate cache |
| GET | `/stock-in/export` | ✅ | Export CSV |

**Auto Finance:** `type=debit`, `amount=quantity × modal_price`, `category` sama dengan StockIn category.
**DB Transaction:** Ya, untuk store + destroy.

#### Stock Out (5 — No update)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/stock-out` | ✅ | List (paginate, filter: product_id, channel, date_from, date_to) |
| POST | `/stock-out` | ✅ | Cek stok → catat → update stok → auto finance kredit → invalidate cache |
| GET | `/stock-out/{id}` | ✅ | Detail + user + product + finance + invoice |
| DELETE | `/stock-out/{id}` | ✅ | Hapus finance → hapus stock-out → recalculate stok → invalidate cache |
| GET | `/stock-out/export` | ✅ | Export CSV |

**Stock Check:** Sebelum transaction, validasi `$product->current_stock >= $validated['quantity']` — return 422 jika kurang.
**Auto Finance:** `type=kredit`, `amount=quantity × sell_price`, `category=penjualan`.
**Out-of-stock notification:** Response includes `out_of_stock: true` jika setelah transaksi product menjadi 0.

#### Finances (5 — No update/delete untuk auto-generated)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/finances` | ✅ | List (paginate, filter: type, category, date_from, date_to) + meta total_kredit/debit/saldo |
| POST | `/finances` | ✅ | Entry manual (operasional, lain-lain) |
| GET | `/finances/{id}` | ✅ | Detail |
| GET | `/finances/summary` | ✅ | Summary per tahun/bulan per category+type |
| GET | `/finances/export` | ✅ | Export CSV |

**Endpoint manual:** Hanya untuk kategori non-stock (operasional, lain-lain). Finance dari stock-in/out/invoice auto-generated.
**Summary:** `?year=2026` `?month=6` — return breakdown by category+type dengan SUM dan COUNT.

#### Invoices (4 — No update)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/invoices` | ✅ | List (paginate, filter: status, buyer_name, date_from, date_to) |
| POST | `/invoices` | ✅ | Buat invoice + items + stock_out + finance (1 DB transaction) |
| GET | `/invoices/{id}` | ✅ | Detail + items + user + stockOuts |
| DELETE | `/invoices/{id}` | ✅ | Hapus invoice cascade: items + stockOut + finance + recalculate stok |

**Total Amount:** Dihitung server-side = `sum(items.quantity × items.unit_price)` — tidak trusted dari client.
**Invoice Number Format:** `INV/YYYY/NNN` (auto-generated via `Invoice::generateNumber()`).

#### Users (5 — Full CRUD)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/users` | ✅ | List semua user (no pagination) |
| POST | `/users` | ✅ | Buat user baru (name, email, password, role, is_active) |
| GET | `/users/{id}` | ✅ | Detail user |
| PUT | `/users/{id}` | ✅ | Update (password nullable — skip jika kosong) |
| DELETE | `/users/{id}` | ✅ | Hapus user (422 jika hapus diri sendiri) |

**Self-delete protection:** `$user->id === request()->user()->id` → 422.

#### Import Excel (6 — 2-step: preview → confirm)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/import/finance/preview` | ✅ | Upload file → parse → return matched rows |
| POST | `/import/finance/confirm` | ✅ | Bulk insert finance records |
| POST | `/import/stock-in/preview` | ✅ | Upload file → parse → return matched rows |
| POST | `/import/stock-in/confirm` | ✅ | Bulk insert + update stok + finance debit |
| POST | `/import/stock-out/preview` | ✅ | Upload file → parse → return matched rows |
| POST | `/import/stock-out/confirm` | ✅ | Per-record transaction (skip jika stok kurang) |

**File Validation:** `required|file|mimes:xlsx,xls|max:5120` (5 MB).
**Preview Flow:** Dropzone → upload → server parse Excel → return matched dengan product → user confirm.
**Confirm Flow:** Receive validated JSON array → insert records with transaction.
**StockOut Confirm:** Per-record transaction — jika stok kurang, SKIP record (continue), jangan rollback semua.
**Date Parsing:** Mendukung Excel serial date, `d/m/Y`, `d-m-Y`, `Y-m-d`, `d/m/y`, `j/n/Y`, `j/n/y`. Date forward-fill untuk baris dengan date kosong.
**Fuzzy Product Matching:** Dua pass — (1) bidirectional `Str::contains()` dengan filter carbon_type; (2) per-word matching untuk kata > 3 karakter.

### 7.4 Route Patterns Penting

```php
// Export routes SEBELUM apiResource (agar tidak tertelan wildcard)
Route::get('/products/export', [ProductController::class, 'export']);
Route::apiResource('products', ProductController::class);

// Stock-in/out/invoice — except 'update' (history immutable)
Route::apiResource('stock-in', StockInController::class)->except(['update']);

// Finance manual — routes explicit, bukan apiResource
Route::get('/finances', ...);
Route::post('/finances', ...);

// Import — 2-step preview → confirm
Route::prefix('import')->group(function () { ... });
```

---

## 8. Business Rules

### 8.1 Aturan Inti (Wajib)

| # | Rule | Implementasi |
|---|---|---|
| 1 | `current_stock` TIDAK pernah di-set langsung. Selalu via `$product->recalculateStock()` | `Product::recalculateStock()` dipanggil di semua StockIn/Out/Invoice controller setelah mutasi |
| 2 | StockIn create → auto Finance debit | `StockInController@store` buat Finance `type=debit`, `amount=qty×modal_price` |
| 3 | StockOut create → auto Finance kredit | `StockOutController@store` buat Finance `type=kredit`, `amount=qty×sell_price` |
| 4 | Invoice create → auto StockOut + Finance dalam 1 DB transaction | `InvoiceController@store`: loop items, buat StockOut + Finance kredit per item, 1 transaction |
| 5 | Invoice delete → cascade-delete StockOut + Finance + recalculate stock | `InvoiceController@destroy`: loop StockOuts, delete finance, delete stockout, recalculate, hapus items & invoice |
| 6 | Produk SoftDeletes — hanya bisa delete jika `current_stock = 0` | `ProductController@destroy`: return 422 jika `current_stock > 0` |
| 7 | Invoice items simpan `product_name`/`product_sku` sebagai snapshot | `InvoiceController@store`: set `product_name` dan `product_sku` dari nilai terkini product |
| 8 | Tidak ada RBAC — semua user (admin/staff) identik permissionnya | Tidak ada middleware role checking di controller |
| 9 | Harga jual stock-out bisa berbeda dari harga katalog | `sell_price` diisi manual di form StockOut |
| 10 | Import stock-out: per-record transaction, skip jika stok kurang | `ImportController@stockOutConfirm`: loop dengan `DB::beginTransaction()`/`commit()`/`rollBack()` per record |
| 11 | Stock-in/out tidak bisa di-update (history immutable) | `apiResource(...)->except(['update'])` untuk StockIn, StockOut, Invoice |
| 12 | Dashboard cache di-invalidate setiap mutation | `Controller::forgetDashboardCache($date)` dipanggil di 6 controller mutation |
| 13 | Total amount invoice dihitung server-side | `collect($items)->sum(fn($i) => $i['quantity'] * $i['unit_price'])`, bukan dari client |

### 8.2 Aturan Validasi

| Entity | Validasi |
|---|---|
| Product SKU | Unique, format `FAC-XXX` (auto-uppercase), max 20 chars |
| Product Photo | `nullable|image|mimes:jpg,jpeg,png,webp|max:2048|dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000` |
| Product Delete | Hanya jika `current_stock === 0` |
| User Password | Min 8 chars, hashed via `Hash::make()` |
| User Delete | Tidak bisa hapus diri sendiri (`id !== auth()->id()`) |
| Stock-out Qty | Harus ≤ `current_stock` product |
| Invoice Items | Min 1 item, semua item harus punya stok cukup (all-or-nothing) |
| Import File | Max 5 MB, format `.xlsx` atau `.xls` |
| All Money Fields | `integer|min:0` (BIGINT) — never float |
| All Price Fields | `integer|min:0` (BIGINT) |

### 8.3 Enum Values (Gunakan Persis)

| Field | Values |
|---|---|
| `carbon_type` (products) | `forged`, `twill` |
| `category` (stock_in) | `pembelian_stok`, `produksi` |
| `channel` (stock_out) | `reseller`, `online`, `langsung` |
| `type` (finances) | `debit`, `kredit` |
| `category` (finances) | `pembelian_stok`, `produksi`, `penjualan`, `operasional`, `lain_lain` |
| `status` (invoices) | `draft`, `confirmed`, `paid` |
| `role` (users) | `admin`, `staff` |

---

## 9. Authentication & Authorization

### 9.1 Metode Auth

FIS menggunakan **Laravel Sanctum** dengan token-based authentication:

1. Login → POST `/auth/login` → validasi email+password → return **plain-text token**
2. Token disimpan di `localStorage('auth_token')` oleh frontend
3. Setiap request API menyertakan header `Authorization: Bearer {token}`
4. Logout → POST `/auth/logout` → hapus token dari database

**Token Lifetime:** 24 jam (config: `'expiration' => 60 * 24` di `config/sanctum.php`)

### 9.2 Token Management

```php
// Login — hapus semua token lama, buat baru (single session)
$user->tokens()->delete();
$token = $user->createToken('auth-token')->plainTextToken;

// Logout — hapus token yang sedang digunakan
$request->user()->currentAccessToken()->delete();
```

**Single-session behavior:** Setiap login baru menghapus semua token lama — user dipaksa login ulang di perangkat lain.

### 9.3 Rate Limiting

Semua rate limiter didaftarkan di `AppServiceProvider::configureRateLimiters()`:

| Limiter | Endpoint | Limit | Key |
|---|---|---|---|
| `login` | POST `/auth/login` | 5 per menit | `email|ip` |
| `api` | All protected | 60 per menit | `user_id` atau `ip` (guest) |

### 9.4 Inactive Account Check

Di AuthController, setelah credential cocok, cek `$user->is_active`:
- Jika false → return 403 "Akun tidak aktif."
- Log via `SecurityLogger::log('login_blocked_inactive', ...)`

### 9.5 Failed Login Logging

```php
SecurityLogger::log('failed_login_attempt', [
    'email' => $validated['email'],
    'reason' => 'invalid_credentials'
]);
```

### 9.6 Authorization (Simplified)

Tidak ada RBAC — semua user dengan token valid bisa mengakses semua endpoint. Perbedaan role (admin/staff) hanya display di UI. Satu-satunya guard adalah:
- UserController `destroy`: Tidak bisa hapus diri sendiri
- Auth login: Inactive account ditolak

---

## 10. Frontend Pages & Components

### 10.1 Page Routing & Code Splitting

Semua halaman di-load dengan `React.lazy()` untuk code splitting, menghasilkan chunk terpisah per halaman:

```jsx
const Products = lazy(() => import('./pages/Products'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
// ... 11 pages total
```

### 10.2 Page List

| Halaman | Route | Type | Data Fetch | Filter | Pagination |
|---|---|---|---|---|---|
| Login | `/login` | Auth form | — | — | — |
| Dashboard | `/dashboard` | Analytics dashboard | `api.get('/dashboard')` | — | — |
| Produk | `/products` | List + CRUD | `api.get('/products')` | Search, type, stock | Server-side (25/page) |
| Tambah/Edit Produk | `/products/create`, `/products/:id/edit` | Form | GET untuk edit, POST/PUT | — | — |
| Stok Masuk | `/stock-in` | Create + list | `api.get('/stock-in')` | product_id, category, date | Server-side |
| Stok Keluar | `/stock-out` | Create + list | `api.get('/stock-out')` | product_id, channel, date | Server-side |
| Keuangan | `/finances` | Create + list | `api.get('/finances')` | type, category | Server-side |
| Faktur | `/invoices` | Create + list + print | `api.get('/invoices')` | status, buyer, date | Server-side |
| Riwayat | `/transactions` | List only | `Promise.all([stockIn, stockOut, finance])` | type, date | Client-side (no pagination) |
| Laporan | `/reports` | Charts + table | `Promise.all([products, stockIn, stockOut])` | date range | — |
| Import | `/import` | Tabbed Excel import | Delegasi ke tab child | — | — |
| Pengguna | `/users` | CRUD modal | `api.get('/users')` | — | — |

### 10.3 Component Hierarchy

```
<BrowserRouter>
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              /login → <Login />
              / → redirect to /dashboard
              <ProtectedRoute>                          ← if not auth → Navigate to /login
                <AppLayout>                             ← sidebar + header + <Outlet />
                  /dashboard → <Dashboard />
                  /products → <Products />
                  /products/create → <ProductForm />
                  /products/:id/edit → <ProductForm />
                  /stock-in → <StockIn />
                  /stock-out → <StockOut />
                  /finances → <Finances />
                  /invoices → <Invoices />
                  /transactions → <Transactions />
                  /reports → <Reports />
                  /import → <Import />
                  /users → <Users />
                </AppLayout>
              </ProtectedRoute>
              * → redirect to /dashboard
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
```

### 10.4 Shared UI Components

| Komponen | Props | Fungsi |
|---|---|---|
| `StatCard` | `title, value, icon, color` | Dashboard stat card |
| `Badge` | `type` (carbon_type) | Carbon type badge (forged/twill) |
| `StockBadge` | `stock` | Warna hijau/merah berdasarkan stok |
| `ProductCard` | `product, onEdit, onDelete, onToggle, onShowDetail` | Catalog mode card |
| `ProductDetailDrawer` | `product, isOpen, onClose, onEdit` | Slide drawer detail produk + stock history |
| `ImageModal` | `src, alt, isOpen, onClose` | Lightbox foto produk |
| `ImageTooltip` | `src, alt, onClick, children` | Hover preview foto pada nama produk di tabel |
| `ErrorBoundary` | `children, fallbackMessage` | Catch React error → fallback UI |
| `LoadingSkeleton` | — | CardSkeleton, TableSkeleton, ChartSkeleton |
| `Pagination` | `meta, onPageChange` | Prev/next + page numbers (max 5 visible) |
| `ConfirmDialog` | `isOpen, title, message, onConfirm, onCancel, loading, variant` | Ganti `window.confirm()` untuk delete |

### 10.5 Import Components

| Komponen | Fungsi |
|---|---|
| `Dropzone.jsx` | File upload area dengan drag & drop |
| `ImportFinanceTab.jsx` | Tab import finance — upload → preview → confirm |
| `ImportStockInTab.jsx` | Tab import stock-in — upload → preview → confirm |
| `ImportStockOutTab.jsx` | Tab import stock-out — upload → preview → confirm |
| `ResultBanner.jsx` | Hasil import: imported count, failed count, error details |

### 10.6 Axios Pattern

File: `frontend/src/api/axios.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // default: http://127.0.0.1:8000/api
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Request interceptor — tambah Bearer token dari localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — 401 → redirect ke /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 10.7 Format Helpers

```javascript
// Currency (rupiah)
const fmt = (n) => n != null
  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  : '—'

// Date format (Indonesian)
const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
```

---

## 11. Backend Architecture

### 11.1 Controller Patterns

#### Standard Response Shape
```php
return response()->json([
    'success' => true,
    'data'    => $result,
    'message' => 'Berhasil',
    'meta'    => $meta ?? null,
], 200);
```

#### DB Transaction Pattern (multi-table)
```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    // ... operations ...
    DB::commit();
    return response()->json(['success' => true, 'data' => ..., 'message' => '...']);
} catch (\Exception $e) {
    DB::rollBack();
    return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
}
```

#### Pagination Pattern
```php
$perPage = min((int) $request->input('per_page', 25), 100);
$records = Model::query()
    ->when($request->search, fn($q, $v) => $q->where(...))
    ->when($request->carbon_type, fn($q, $v) => $q->where('carbon_type', $v))
    ->orderBy('sku')
    ->paginate($perPage);
```

#### Eager Loading Pattern
```php
$records->load('product:id,sku,name,carbon_type');
$records->load('user:id,name');
```

### 11.2 Cache Architecture

**Cache Key:** `dashboard_{year}_{month}` (contoh: `dashboard_2026_6`)
**Cache Store:** `file` di production (Render), `database` di local
**TTL:** 300 detik (5 menit)

**Invalidation Method** (di base `Controller.php`):
```php
protected function forgetDashboardCache(string $date = null): void
{
    $d = $date ? now()->parse($date) : now();
    Cache::forget("dashboard_{$d->year}_{$d->month}");
}
```

**Controllers that invalidate:**
| Controller | store | destroy | Other |
|---|---|---|---|
| ProductController | ✅ (now) | ✅ (now) | toggleActive (now) |
| StockInController | ✅ (date) | ✅ (stockIn.date) | — |
| StockOutController | ✅ (date) | ✅ (stockOut.date) | — |
| InvoiceController | ✅ (date) | ✅ (invoice.date) | — |
| FinanceController | ✅ (date) | — | — |

### 11.3 Middleware

| Middleware | Route | Fungsi |
|---|---|---|
| `auth:sanctum` | All protected routes | Token authentication |
| `throttle:login` | POST `/auth/login` | 5 req/min per email+IP |
| `throttle:api` | All protected routes | 60 req/min per user/IP |
| `SecurityHeaders` | Global (kernel) | CSP, X-Frame-Options, dll |

**SecurityHeaders** menambahkan:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'`

### 11.4 AppServiceProvider

Tiga inisialisasi di `boot()`:

1. **configureRateLimiters()** — register `login` (5/min) dan `api` (60/min)
2. **validateEnvironment()** — cek config key kosong → `Log::warning()`. Di production juga cek DB config. TIDAK throw exception (downgrade dari throw ke warning untuk hindari crash).
3. **forceHttpsInProduction()** — jika `APP_ENV=production`, force HTTPS via `URL::forceScheme('https')`

### 11.5 Soft Delete Status per Model (Update Terakhir)

| Model | SoftDeletes | Alasan |
|---|---|---|
| `User` | ❌ | Hard delete |
| `Product` | ✅ | Relasi dengan stock-in/out/invoice items perlu tetap ada |
| `StockIn` | ❌ | `deleted_at` belum ada di production — hard delete |
| `StockOut` | ❌ | `deleted_at` belum ada di production — hard delete |
| `Finance` | ❌ | `deleted_at` belum ada di production — hard delete |
| `Invoice` | ✅ | Perlu audit trail |
| `InvoiceItem` | ❌ | Cascade delete dengan invoice |

**Catatan:** SoftDeletes semula di-apply ke StockIn, StockOut, Finance via migration `add_soft_deletes_to_stock_tables.php`, namun migration tersebut belum jalan di production Render. Akibatnya, Laravel mengasumsikan kolom `deleted_at` ada dan query menjadi 500. Solusi: `SoftDeletes` trait di-remove dari ketiga model tersebut.

---

## 12. State Management

### 12.1 Context & Hooks

FIS menggunakan **React Context API** untuk global state, dengan hooks yang dipisah ke file terpisah untuk **React Fast Refresh compatibility**:

#### AuthContext (`context/AuthContext.jsx` + `useAuth.js`)

| Item | Detail |
|---|---|
| State | `user` (dari localStorage), `loading` |
| Actions | `login(email, password)`, `logout()` |
| Storage | `auth_token` + `auth_user` di localStorage |
| Expose | `{ user, login, logout, loading, isAuthenticated }` |
| Hook | `useAuth()` |

#### ThemeContext (`context/ThemeContext.jsx` + `useTheme.js`)

| Item | Detail |
|---|---|
| State | `theme` ('dark'/'light') dari localStorage |
| Actions | `toggle()` — toggle dark/light |
| Effect | Toggle `.light` class di `<html>`, persist ke localStorage |
| Expose | `{ theme, toggle, isDark }` |
| Hook | `useTheme()` |

#### ToastContext (`context/ToastContext.jsx` + `useToast.js`)

| Item | Detail |
|---|---|
| State | Daftar toast `{ id, message, type }` |
| Actions | `toast(message, type='success', duration=3000)` |
| Types | `success` (hijau), `error` (merah), `warning` (kuning), `info` (accent) |
| Auto-dismiss | Setelah `duration` ms |
| Expose | `{ toast }` |
| Hook | `useToast()` |

**Kenapa hooks dipisah:** React 19 Fast Refresh melarang export component dan hooks dari file yang sama. Provider components ada di `AuthContext.jsx`, `ThemeContext.jsx`, `ToastContext.jsx`; sementara hooks export di file terpisah `useAuth.js`, `useTheme.js`, `useToast.js`.

### 12.2 Component State Pattern

Halaman-halaman CRUD menggunakan pola `useState` untuk local state:

| Kategori State | Contoh |
|---|---|
| Data | `products`, `records`, `meta` |
| UI | `loading`, `submitting`, `deleting`, `toggling` |
| Filter | `search`, `filterType`, `filterStock`, `page` |
| Form | `form` (object), `errors` (validation), `serverError` |
| Modal | `showModal`, `confirmDelete`, `previewInvoice` |

**Parallel Fetch Pattern** (Transactions, Reports):
```javascript
const [stockIns, setStockIns] = useState([])
const [stockOuts, setStockOuts] = useState([])
const [finances, setFinances] = useState([])

useEffect(() => {
  Promise.all([
    api.get('/stock-in').catch(() => ({ data: { data: [] } })),
    api.get('/stock-out').catch(() => ({ data: { data: [] } })),
    api.get('/finances').catch(() => ({ data: { data: [] } })),
  ]).then(([ins, outs, fins]) => {
    setStockIns(ins.data.data)
    setStockOuts(outs.data.data)
    setFinances(fins.data.data)
  })
}, [])
```

---

## 13. Key Implementation Details

### 13.1 Stok Management — `recalculateStock()`

Stok TIDAK di-update manual. Setiap mutasi stok (StockIn create/delete, StockOut create/delete, Invoice create/delete) memanggil:

```php
$product->recalculateStock();
```

Method ini menjumlahkan semua qty dari stock_in dan stock_out yang terkait dengan product:

```php
public function recalculateStock(): void
{
    $this->current_stock = max(0,
        $this->stockIns()->sum('quantity') - $this->stockOuts()->sum('quantity')
    );
    $this->saveQuietly();
}
```

`saveQuietly()` digunakan untuk menghindari event loop jika ada observer/saving event.

### 13.2 Invoice Multi-Item Transaction

Invoice create adalah operasi paling kompleks — semua dalam 1 `DB::transaction()`:

```
1. Buat record Invoice
2. Loop items:
   a. Validasi stok product cukup
   b. Buat InvoiceItem dengan snapshot product_name & product_sku
   c. Buat StockOut record
   d. Panggil recalculateStock() untuk product
   e. Buat Finance kredit record
3. Hitung total_amount = sum(subtotal items)
4. Commit transaction
```

Jika ada item yang gagal (stok kurang), throw Exception → rollback semua.

### 13.3 Invoice Delete Cascade

```
1. Loop stockOuts terkait:
   a. Hapus finance record stockOut
   b. Hapus stockOut record
   c. Panggil recalculateStock() untuk product
2. Hapus invoice items (cascade otomatis)
3. Hapus invoice (soft delete)
```

### 13.4 Dashboard Cache

Dashboard menggunakan Laravel Cache facade dengan key `dashboard_{year}_{month}`:

```php
$cacheKey = "dashboard_{$now->year}_{$now->month}";
$data = Cache::remember($cacheKey, 300, function () use ($now) {
    // Hitung semua statistik
    return [
        'products' => ['total' => ..., 'active' => ..., 'out_of_stock' => ...],
        'stock' => ['stock_in_qty' => ..., 'stock_out_qty' => ...],
        'finances' => ['total_kredit' => ..., 'total_debit' => ..., 'laba_kotor' => ...],
        'invoices' => ['count' => ..., 'total_amount' => ...],
        'alerts' => ['out_of_stock_products' => [...]],
        'recent_sales' => [...],
        'monthly_chart' => [
            ['label' => 'Jan 2026', 'masuk' => 50, 'keluar' => 30],
            // ... 6 bulan
        ],
    ];
});
```

**Invalidasi:** Controller base class punya `forgetDashboardCache($date)` yang dipanggil oleh semua mutation controller. Ini memastikan dashboard selalu menampilkan data terkini.

### 13.5 Export CSV Pattern

4 endpoints export menggunakan `StreamedResponse`:

```php
public function export(Request $request): StreamedResponse
{
    $response = new StreamedResponse(function () {
        $handle = fopen('php://output', 'w');
        fputcsv($handle, ['Kolom1', 'Kolom2', ...]); // header
        Product::chunk(100, function ($products) use ($handle) {
            foreach ($products as $p) {
                fputcsv($handle, [$p->sku, $p->name, ...]);
            }
        });
        fclose($handle);
    }, 200, [
        'Content-Type' => 'text/csv; charset=utf-8',
        'Content-Disposition' => 'attachment; filename="export.csv"',
    ]);
    return $response;
}
```

Frontend download via `exportCSV.js` — blob download dengan Axios.

### 13.6 Product Photo Upload

**Backend validation:**
```php
'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048|dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000'
```

**Storage:** `storage/app/public/products/` — symlink ke `public/storage`.
**Access:** Via `asset('storage/' . $path)` → `photo_url` attribute di model.

**Update support:** Field `remove_photo` yang bisa dikirim untuk menghapus foto saat update.

### 13.7 React Fast Refresh — Hook Separation

React 19 Fast Refresh secara default tidak bisa mengekspor component dan hooks dari file yang sama. Solusi: Provider context components di satu file (`AuthContext.jsx`, `ThemeContext.jsx`, `ToastContext.jsx`), sementara hooks dipisah ke file terpisah (`useAuth.js`, `useTheme.js`, `useToast.js`) yang hanya berisi:

```javascript
// useAuth.js — hanya hook, tidak ada component
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 13.8 Import Excel — Fuzzy Product Matching

Import stok-in dan stok-out menggunakan **fuzzy matching** dua pass karena file Excel hanya berisi nama produk (bukan ID):

1. **Pass 1 — Bidirectional contains:** Cocokkan nama produk dari Excel dengan nama produk di database menggunakan `Str::contains()` dua arah, dengan filter carbon_type jika tersedia
2. **Pass 2 — Word matching:** Untuk setiap kata > 3 karakter di input, cek apakah ada di nama produk database

**Date Parsing:** Mendukung multiple format:
- Excel serial date (angka integer)
- `d/m/Y`, `d-m-Y`
- `Y-m-d`
- `d/m/y`, `j/n/Y`, `j/n/y`
- Forward-fill: jika baris memiliki date kosong, gunakan date dari baris sebelumnya

### 13.9 Rate Limiter Implementation

```php
// Di AppServiceProvider::configureRateLimiters()
RateLimiter::for('login', function (Request $request): Limit {
    return Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip());
});

RateLimiter::for('api', function (Request $request): Limit {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

### 13.10 Enum Values

Semua enum disimpan sebagai string di database (tidak menggunakan PHP 8.1 native enum atau `->asEnum()` cast Laravel). Validasi dilakukan di Form Request atau langsung di controller rule:

```php
'carbon_type' => 'required|in:forged,twill',
'category'    => 'required|in:pembelian_stok,produksi',
'channel'     => 'required|in:reseller,online,langsung',
'type'        => 'required|in:debit,kredit',
'status'      => 'required|in:draft,confirmed,paid',
```

---

## 14. Testing Strategy

### 14.1 Test Framework & Setup

- **Framework:** PHPUnit 12.x via Laravel
- **Database:** SQLite in-memory via `RefreshDatabase` trait
- **Auth:** Sanctum token via `User::factory()->create()->createToken('test')->plainTextToken`
- **Location:** `backend/tests/Feature/Api/`

### 14.2 Test Files & Coverage

| Test File | Tests | Coverage |
|---|---|---|
| `AuthTest.php` | 6 | Login valid, invalid, inactive account, logout, me, unauthenticated rejection |
| `ProductApiTest.php` | 6 | List, create, show, update, delete (stock>0 → fail, stock=0 → ok), toggle active |
| `StockInApiTest.php` | 3 | Create + stock update + finance auto, list, delete + recalculate |
| `StockOutApiTest.php` | 3 | Create + stock update + finance auto + out-of-stock notification, reject insufficient stock, delete + recalculate |
| `FinanceApiTest.php` | 10 | Create debit, create kredit, list, filter by type, filter by category, show, validation errors (5 variants: missing fields, invalid type, invalid category, invalid amount) |
| `InvoiceApiTest.php` | 4 | Create multi-item + stock-out + finance, delete cascade + stock revert, reject insufficient stock, list |
| `ImportApiTest.php` | 10 | Finance preview (2: no file, invalid type), stock-in preview (2: no file, invalid type), stock-out preview (2: no file, invalid type), finance confirm, stock-in confirm, stock-out confirm (sufficient stock), stock-out confirm (insufficient stock → skip) |
| **Total** | **42** | |

### 14.3 Key Test Patterns

**Authorization Test:**
```php
$user = User::factory()->create();
$token = $user->createToken('test')->plainTextToken;

$response = $this->withHeaders([
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json',
])->getJson('/api/products');
```

**Unauthenticated Test:**
```php
$response = $this->getJson('/api/auth/me');
$response->assertUnauthorized();
```

**Transaction Test (multi-table):**
```php
$product = Product::factory()->create(['current_stock' => 10]);
$user = User::factory()->create();

$response = $this->actingAs($user)->postJson('/api/stock-out', [
    'product_id' => $product->id,
    'quantity' => 5,
    'channel' => 'langsung',
    'sell_price' => 150000,
    'date' => '2026-06-01',
]);

$response->assertCreated();
$this->assertDatabaseHas('stock_out', ['quantity' => 5]);
$this->assertDatabaseHas('finances', [
    'type' => 'kredit',
    'amount' => 750000, // 5 × 150000
]);
```

**Stock Insufficiency Test:**
```php
$product = Product::factory()->create(['current_stock' => 2]);
$response = $this->actingAs($user)->postJson('/api/stock-out', [
    'product_id' => $product->id,
    'quantity' => 999,  // Lebih dari stok
    // ...
]);
$response->assertStatus(422);
```

**Import Skip Test (stock-out):**
```php
$product = Product::factory()->create(['current_stock' => 0]);
$response = $this->actingAs($user)->postJson('/api/import/stock-out/confirm', [
    'records' => [['product_id' => $product->id, 'quantity' => 1, ...]]
]);
$response->assertJsonPath('data.imported', 0);
$response->assertJsonPath('data.failed', 1);
```

### 14.4 Factory Setup

**ProductFactory:** Auto-increment SKU `FAC-001` → `FAC-NNN`, random carbon type, random modal/reseller/online prices, `current_stock=0` (default).

**Setup untuk stock test:** ProductFactory di-create dengan `current_stock` tertentu, dan untuk stock-out/invoice test, manual create StockIn + recalculateStock:
```php
$product = Product::factory()->create();
$product->stockIns()->create([
    'user_id' => $user->id,
    'quantity' => 20,
    'modal_price' => 50000,
    'category' => 'pembelian_stok',
    'date' => '2026-01-01',
]);
$product->recalculateStock(); // stock becomes 20
```

### 14.5 Test Environment

Tests menggunakan SQLite in-memory via `RefreshDatabase`:
- Database di-create ulang setiap test
- Migrasi dijalankan otomatis
- Data seed TIDAK dijalankan (Factory digunakan langsung di test)
- Sanctum token authentication via `actingAs()` helper

---

## 15. Deployment

### 15.1 Deployment Architecture

```
┌─────────────────────────┐       ┌──────────────────────────┐
│    Vercel (Frontend)    │       │   Render (Backend + DB)  │
│                         │       │                          │
│  facarbon-inventory-    │       │  facarbon-backend.       │
│  system.vercel.app      │       │  onrender.com            │
│                         │       │                          │
│  VITE_API_URL=https://  │       │  PHP Web Service         │
│  facarbon-backend.      │       │  MySQL 8 Database        │
│  onrender.com/api       │       │  Singapore Region        │
└────────────┬────────────┘       └────────────┬─────────────┘
             │                                 │
             └─────────── HTTPS ───────────────┘
```

### 15.2 Frontend (Vercel)

**`vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ]}
  ]
}
```

**Environment Variable di Vercel Dashboard:**
- `VITE_API_URL=https://facarbon-backend.onrender.com/api`

**Build:** `npm run build` → Vite output `dist/`
**SPA Routing:** Semua route di-rewrite ke `/index.html`

### 15.3 Backend (Render)

**`render.yaml`:**
```yaml
services:
  - type: web
    name: facarbon-api
    runtime: php
    region: singapore
    plan: free
    buildCommand: composer install --no-dev --optimize-autoloader
    startCommand: php artisan migrate --force --isolated && php artisan serve --host=0.0.0.0 --port=$PORT
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: false
      - key: APP_KEY
        sync: false
      - key: DB_CONNECTION
        value: mysql
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: 3306
      - key: DB_DATABASE
        sync: false
      - key: DB_USERNAME
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: SANCTUM_STATEFUL_DOMAINS
        sync: false
      - key: CORS_ALLOWED_ORIGINS
        sync: false
      - key: CACHE_STORE
        value: file
      - key: SESSION_DRIVER
        value: file
```

**Environment Variables (set manual di Render Dashboard — `sync: false`):**
- `APP_KEY` — generated via `php artisan key:generate`
- `DB_HOST` — Render MySQL internal host
- `DB_DATABASE` — database name
- `DB_USERNAME` — database user
- `DB_PASSWORD` — database password
- `SANCTUM_STATEFUL_DOMAINS` — Vercel domain
- `CORS_ALLOWED_ORIGINS` — Vercel domain

**Key Production Differences:**
| Config | Local (.env) | Production (Render) |
|---|---|---|
| `APP_ENV` | `local` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `CACHE_STORE` | `database` | `file` |
| `SESSION_DRIVER` | `database` | `file` |
| `QUEUE_CONNECTION` | `database` | (default) |

`CACHE_STORE=file` dan `SESSION_DRIVER=file` di production untuk menghindari dependency pada database yang bisa menjadi bottleneck.

### 15.4 CORS Configuration

```php
// config/cors.php
'allowed_origins' => [
    'https://facarbon-inventory-system.vercel.app',
    'https://facarbon-inventory-system-r8c5sz74h-uletbulujawa.vercel.app', // preview
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
],
'supports_credentials' => false, // token-based, not cookie-based
```

### 15.5 Docker (Alternatif Deploy)

**Multi-stage Dockerfile:**
1. `php:8.3-cli` — backend, composer install, serve port 8000
2. `node:22-alpine` — frontend build
3. `nginx:alpine` — serve frontend dist + proxy /api/ ke backend

**`docker-compose.yml`:**
- `mysql:8.0` — port 3306, persistent volume
- `backend` — build stage 1, port 8000, live code mount
- `frontend` — build stage 3, port 80, nginx SPA + API proxy

**Nginx config:**
```nginx
location / {
    try_files $uri $uri/ /index.html;      # SPA fallback
}
location /api/ {
    proxy_pass http://backend:8000;         # API proxy
}
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {
    expires 1y;                             # Cache static assets
}
```

### 15.6 CI/CD History

**Awal:** `.github/workflows/ci.yml` + `deploy.yml`:
- `ci.yml`: Backend (composer validate, install, audit, pint, migrate, test) + Frontend (npm ci, lint, build) — on push/PR ke `main`
- `deploy.yml`: Test → Vercel → Render — on push ke `main`

**Akhir:** Kedua workflow dihapus (commit `05a8b48`). Frontend dan backend auto-deploy langsung dari Git provider (Vercel dan Render terhubung langsung ke GitHub repo).

---

## 16. Version Control History

### 16.1 Commit Log

Diurutkan dari yang terbaru:

| Hash | Tanggal | Tipe | Pesan |
|---|---|---|---|
| `075c340` | 27 Jun | fix | Group Tambah Produk + Export CSV buttons |
| `05a8b48` | 27 Jun | remove | CI/CD workflows (auto-deploy via Vercel/Render) |
| `fe076da` | 27 Jun | fix | Relax composer validate (remove --strict) |
| `676149c` | 27 Jun | fix | Add license to composer.json |
| `c1db493` | 27 Jun | fix | Array.isArray guard for out_of_stock_products |
| `f5fb6f5` | 27 Jun | fix | Defensive check for out_of_stock_products |
| `211faa0` | 27 Jun | fix | Remove SoftDeletes from StockIn/StockOut/Finance |
| `9ebf9b4` | 27 Jun | fix | validateEnvironment from throw to log warning |
| `84c310b` | 27 Jun | chore | Gitignore AGENTS.md and context.md |
| `43d4fa9` | 27 Jun | fix | Skip config validation during CLI (Docker build) |
| `9d0962a` | 27 Jun | chore | Commit all uncommitted changes |
| `5658ae1` | 27 Jun | chore | Render deploy config + cache/session driver |
| `8bb3e9d` | 27 Jun | feat | Export CSV, ConfirmDialog, Users page, products pagination |
| `0f4b9a1` | 27 Jun | feat | Server-side products pagination, export endpoints, dashboard cache |
| `2a6c09e` | 27 Jun | feat | Soft delete stok masuk/keluar/keuangan + cache table |
| `80fb4b6` | 27 Jun | ux | Smooth transitions all components |
| `375db3d` | 27 Jun | fix | Lower preview zIndex |
| `a8e940a` | 27 Jun | fix | Preview modal overlay |
| `24e6242` | 27 Jun | fix | Hide preview tooltip before modal |
| `bb8b613` | 27 Jun | fix | Preview hover + clickable modal |
| `977e6e2` | 27 Jun | refactor | Image preview position, list only |
| `1d61e64` | 27 Jun | feat | Hover product name → image preview |
| `f145aae` | 27 Jun | refactor | Modal detail from drawer to centered |
| `e817250` | 27 Jun | refactor | Remove ImagePreview, hover → drawer |
| `08ed51f` | 27 Jun | feat | Product detail drawer with stock history |
| `2a9a356` | 27 Jun | feat | Show reseller + online prices in catalog card |
| `45fafef` | 27 Jun | feat | Rate limiting + cleanup orphan src/ |
| `f6ff53a` | 27 Jun | feat | Catalog grid mode + list/catalog toggle |
| `1112f0d` | 27 Jun | feat | Image preview tooltip, lightbox, photo upload |
| `93bfa72` | 27 Jun | feat | Add CONTEXT.md + gitignore AI config |

**Total commits:** 30+ (hanya dihitung dari yang tercatat dalam git log)

### 16.2 Branch Strategy

- **`main`** — production branch, auto-deploy ke Vercel + Render
- Tidak ada branch development terpisah (proyek individu → push langsung ke main)
- **Conventional commits:** `feat:`, `fix:`, `refactor:`, `chore:`, `ux:`, `remove:`

---

## 17. Optimization & Performance

### 17.1 Frontend Optimization

| Optimasi | Detail | Impact |
|---|---|---|
| **Code Splitting** | Semua 11 page routes via `React.lazy()` | Main bundle: 842KB → 241KB |
| **Chunk per Page** | Setiap halaman chunk sendiri (2KB–33KB) | Load on demand |
| **Recharts as Lazy Chunk** | BarChart component 349KB (terberat karena Recharts) | Tidak blocking initial load |
| **CSS Variables** | Single CSS file, no runtime CSS-in-JS | Minimal CSS footprint |
| **Static Asset Cache** | Vercel: 1-year immutable cache untuk `/assets/*` | Faster repeat visits |
| **Loading Skeletons** | CardSkeleton, TableSkeleton, ChartSkeleton | Perceived performance lebih cepat |

### 17.2 Backend Optimization

| Optimasi | Detail | Impact |
|---|---|---|
| **Server-side Pagination** | `->paginate($perPage)` default 25, max 100 | Hindari load ribuan record |
| **Server-side Filtering** | Filter via query params → WHERE clause | Only relevant data |
| **Eager Loading** | `load('product:id,sku,name')` — hanya kolom yang dibutuhkan | Hindari N+1 queries |
| **Dashboard Cache** | `Cache::remember(300)` + explicit invalidation | Dashboard load < 100ms |
| **Database Indexes** | Composite indexes pada date + foreign key | Query cepat untuk filter date range |
| **Chunked CSV Export** | `Product::chunk(100, ...)` — tidak load semua di memory | Export large dataset |
| **CACHE_STORE=file** | Production: file-based cache, bukan database | Tidak overload DB |

### 17.3 Bundle Size Analysis

| Chunk | Size | Notes |
|---|---|---|
| Main bundle | 241KB | React + React Router + Lucide + context |
| Dashboard | ~25KB | Recharts BarChart + StatCards |
| Products | ~20KB | Table + filters + ProductCard |
| Invoices | ~35KB | InvoiceDocument (react-to-print) |
| Import | ~15KB | Dropzone + tab components |
| Login | ~5KB | Minimal |
| Others | ~10-20KB each | |

### 17.4 Performance Considerations

- **Transactions page:** Tidak ada pagination — fetch all data client-side. Scale issue untuk dataset besar (1000+ record). Solusi future: backend aggregation endpoint.
- **Laporan page:** Sama — fetch all + compute client-side. Scale issue di masa depan.
- **Export CSV:** Gunakan chunk untuk dataset besar — aman untuk ribuan record.
- **Dashboard cache:** 5 menit TTL — trade-off antara freshness dan performance. Cocok untuk aplikasi dengan frekuensi update rendah-sedang.

---

## 18. Security Measures

### 18.1 Authentication & Session

| Measure | Detail |
|---|---|
| **Token-based Auth** | Laravel Sanctum, `Authorization: Bearer` header |
| **Token Expiry** | 24 jam (`config/sanctum.php`) |
| **Token Rotation** | Login baru → hapus semua token lama → single session |
| **Password Hashing** | bcrypt via `Hash::make()`, BCRYPT_ROUNDS=12 |
| **Input Validation** | Semua input divalidasi (required, type, enum, dll) |
| **Rate Limiting** | Login: 5/min, API: 60/min |

### 18.2 HTTP Security Headers

Semua response API mendapatkan headers via `SecurityHeaders` middleware:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'` |

### 18.3 Business Logic Security

| Guard | Implementation |
|---|---|
| **Stock guard** | Stock-out & invoice cek `current_stock ≥ quantity` → 422 jika tidak cukup |
| **Product delete guard** | Hanya jika `current_stock = 0` → 422 jika > 0 |
| **Self-delete guard** | User tidak bisa hapus akun sendiri → 422 |
| **Inactive account** | Login ditolak dengan 403 jika `is_active = false` |
| **Failed login logging** | `SecurityLogger::log('failed_login_attempt', ...)` |
| **Token on logout** | Hanya hapus token yang sedang digunakan |
| **Invoice total from server** | Total amount dihitung server-side |

### 18.4 File Upload Security

| Measure | Detail |
|---|---|
| **File type** | Only `jpg, jpeg, png, webp` untuk foto |
| **File size** | Max 2048 KB (2 MB) untuk foto |
| **Image dimensions** | Min 100×100, Max 4000×4000 |
| **Import files** | Only `xlsx, xls`, max 5120 KB (5 MB) |
| **Storage** | Files di `storage/app/public/products/` — private dari direct web access |

### 18.5 Eloquent ORM Safety

| Measure | Detail |
|---|---|
| **Mass assignment** | `$fillable` di semua model — whitelist approach |
| **No raw SQL** | Tidak ada `DB::raw()` atau `whereRaw()` — semua via Eloquent/Query Builder |
| **SQL injection** | Parameter binding otomatis via Eloquent |
| **XSS** | Data ditampilkan via React JSX (auto-escaped) |

---

## 19. Development Workflow

### 19.1 Local Development Setup

```bash
# Prasyarat: Laragon (PHP 8.3, MySQL 8, Node 18+), Composer, Git

# Clone
git clone https://github.com/pandjiSTR/facarbon-inventory-system.git
cd facarbon-inventory-system

# Backend
cd backend
cp .env.example .env
# Edit .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD
composer install
php artisan key:generate
php artisan migrate --seed   # 2 users + 24 products
php artisan serve            # http://127.0.0.1:8000

# Frontend (terminal terpisah)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### 19.2 Seed Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@facarbon.com | facarbon123 |
| Staff | staff@facarbon.com | facarbon123 |

### 19.3 Development Scripts

**Backend:**
```bash
composer install              # Install dependencies
composer update               # Update dependencies
./vendor/bin/pint             # Code style fix (PSR-12)
./vendor/bin/pint --test      # Check code style only
php artisan test              # Run feature tests
php artisan migrate:fresh --seed  # Reset DB + seed
composer audit                # Check dependencies for CVEs
```

**Frontend:**
```bash
npm run dev                   # Start dev server (port 5173)
npm run build                 # Production build
npm run lint                  # ESLint check
npm run preview               # Preview production build
```

### 19.4 Local Dev Sharing (Testing from Mobile/External)

```bash
# Backend
cloudflared tunnel --url http://localhost:8000

# Frontend — tambahkan di vite.config.js:
server: {
  allowedHosts: ['.trycloudflare.com'],
  host: true,
}
```

### 19.5 Technology Choices Rationale

| Choice | Kenapa |
|---|---|
| **Laravel 13** | Familiaritas tim, ecosystem matang untuk REST API, Eloquent ORM, Sanctum auth |
| **React 19** | SPA modern, component-based, React 19 Fast Refresh untuk dev speed |
| **Vite 8** | Build tool tercepat untuk React, HMR cepat |
| **TailwindCSS 4** | Utility-first CSS, Vite plugin, small bundle via tree-shaking |
| **MySQL 8** | Relational database standard, tersedia di Laragon + Render |
| **Recharts** | Declarative charting, native React, responsive |
| **Sanctum** | Token API sederhana (bukan OAuth kompleks), cukup untuk SPA |
| **Maatwebsite/Excel** | De facto standard Laravel Excel import/export |
| **Vercel** | Free, zero-config Vite deploy, auto HTTPS, CDN global |
| **Render** | Free tier, PHP native support, MySQL managed service |

### 19.6 Environment Configuration

**`.env.example`:**
```ini
APP_NAME=Facarbon
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost
APP_LOCALE=id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=facarbon_db
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 20. Known Issues & Limitations

### 20.1 Current Issues (27 Juni 2026)

| Issue | Detail | Impact |
|---|---|---|
| **SoftDelete mismatch** | StockIn/StockOut/Finance tidak punya `deleted_at` di production → SoftDeletes di-remove. Data terhapus permanen (no audit trail). | Sesuai design awal (hard delete), tapi berbeda dari ekspektasi dokumentasi |
| **`register` route error** | Route `/auth/register` ada di `api.php` tapi controller tidak punya method `register()`. Memanggil endpoint ini akan error. | Tidak mengganggu — register via UserController (admin-only) |
| **`min_stock` tidak ada di DB** | Field `min_stock` tidak ada di migration/model, hanya di form ProductForm (nilai dikirim tapi diabaikan backend). | Low stock badge di Sidebar selalu 0 |
| **Sidebar low stock badge** | `AppLayout` fetch `/products?low_stock=1` di frontend yang tidak didukung backend filter → selalu 0. | Badge merah tidak pernah muncul |
| **Products seeder vespa_compatibility** | Seeder menyimpan string bukan JSON array. Cast ke `array` menghasilkan array dengan 1 elemen (string). | Bisa menyebabkan issue display di frontend jika kode mengharapkan multi-element array |
| **Transactions tanpa pagination** | Halaman Transactions fetch ALL data dan filter client-side. Dataset besar (1000+) bisa lambat. | Scale issue for future growth |
| **Reports tanpa pagination** | Sama seperti Transactions — fetch all, compute client-side. | Scale issue |
| **`total_quantity` dan `total_modal` di meta** | Hanya untuk record di halaman saat ini (page-level), bukan semua record. | Bisa menyesatkan jika user kira itu total seluruh data |
| **CORS di local** | `supports_credentials: false` — cookie-based SPA auth tidak didukung. Hanya token auth. | Sesuai design, bukan bug |
| **Node 18+ requirement** | Frontend butuh Node 18+. Laragon default mungkin Node 16. | Harus upgrade Node via Laragon |

### 20.2 Missing Features (Future Roadmap)

| Fitur | Alasan belum ada | Priority |
|---|---|---|
| **Activity Log** | Belum diimplementasikan — tidak ada tracking siapa buka/hapus apa | High |
| **Bulk Delete** | Select + batch delete di StockIn, StockOut, Finances | Medium |
| **Mobile Responsive Sidebar** | Sidebar fixed 220px — tidak collapsible di mobile | Medium |
| **PWA / Offline Mode** | Service worker + manifest belum ditambahkan | Low |
| **React Query / SWR** | Masih pakai `useEffect` pattern — belum caching fetch | Low |
| **Error Tracking (Sentry)** | Belum diintegrasikan | Low |
| **User Permission (RBAC)** | Semua user sama — belum ada pembedaan akses | Low |
| **Email Notification** | Notifikasi stok kosong via email | Low |
| **Dedicated Summary API** | Transactions & Reports fetch all data client-side | Medium |

### 20.3 Technical Debt

| Debt | Detail | Effort to Fix |
|---|---|---|
| **Duplicate CSS approach** | Mix of Tailwind utilities + inline styles — tidak konsisten | Medium |
| **No TypeScript** | Frontend menggunakan JavaScript, bukan TypeScript | High |
| **Inline styles everywhere** | Tidak reusable — duplikasi style objects di banyak komponen | Medium |
| **No centralized error handling** | Error handling pattern berbeda antar halaman (ada `alert()`, ada toast) | Low |
| **No Form Request classes** | Validasi di controller, bukan Form Request terpisah | Low |
| **No API Resources** | Response manual `response()->json(...)` bukan Laravel API Resource | Low |

---

## Lampiran A: File Path Referensi Cepat

| Kategori | Path |
|---|---|
| **Backend Controllers** | `backend/app/Http/Controllers/Api/` |
| **Models** | `backend/app/Models/` |
| **Routes** | `backend/routes/api.php` |
| **Migrations** | `backend/database/migrations/` |
| **Seeders** | `backend/database/seeders/` |
| **Tests** | `backend/tests/Feature/Api/` |
| **Config** | `backend/config/cors.php`, `sanctum.php`, `excel.php` |
| **Provider** | `backend/app/Providers/AppServiceProvider.php` |
| **Middleware** | `backend/app/Middleware/SecurityHeaders.php` |
| **Helpers** | `backend/app/Helpers/SecurityLogger.php` |
| **Imports** | `backend/app/Imports/` |
| **Frontend Pages** | `frontend/src/pages/` |
| **Frontend Components** | `frontend/src/components/ui/`, `layout/`, `import/` |
| **Frontend Context** | `frontend/src/context/` |
| **Frontend API** | `frontend/src/api/axios.js` |
| **Frontend CSS** | `frontend/src/index.css` |
| **Design Reference** | `docs/SRS_FIS_Facarbon_v1.1.docx` |

---

## Lampiran B: Istilah & Glossary

| Istilah | Arti |
|---|---|
| **FIS** | Facarbon Inventory System |
| **Carbon Forged** | Jenis carbon fiber yang dibuat dengan metode forging |
| **Carbon Twill** | Jenis carbon fiber dengan tekstur anyaman diagonal |
| **SKU** | Stock Keeping Unit — kode unik produk (FAC-XXX) |
| **Sanctum** | Laravel package untuk token-based API authentication |
| **Soft Delete** | Data tidak dihapus dari DB, hanya ditandai `deleted_at` |
| **SPA** | Single Page Application — satu halaman HTML dengan JS routing |
| **Code Splitting** | Memecah bundle JS menjadi chunk yang di-load sesuai kebutuhan |
| **Rate Limiting** | Pembatasan jumlah request per waktu tertentu |
| **CORS** | Cross-Origin Resource Sharing — izin akses antar domain berbeda |
| **Eloquent ORM** | Laravel Active Record implementation untuk database |
| **TTL** | Time-To-Live — masa berlaku cache |
| **DB Transaction** | Unit kerja database yang atomic (all-or-nothing) |
| **PWA** | Progressive Web Application — app bisa di-install di perangkat |
| **CSP** | Content Security Policy — header keamanan untuk mencegah XSS |

---

> **Dokumen ini disusun untuk keperluan akademik sebagai sumber materi**
> **penulisan laporan dan jurnal ilmiah.**
>
> *Sistem Informasi Inventori & Keuangan Facarbon (FIS)*
> *Mohammad Panji Satrio (13240019) & Anaya Bintang Prawidya (13240011)*
> *2026*
