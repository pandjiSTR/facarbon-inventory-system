# 🛵 Facarbon Inventory System (FIS)

Sistem manajemen inventori & keuangan berbasis web untuk **Facarbon** — toko aksesoris carbon Vespa matic. Dibangun untuk menggantikan pencatatan manual berbasis Excel dengan sistem yang lebih terstruktur, otomatis, dan interaktif.

> 🎓 Proyek ini dikembangkan sebagai tugas kuliah dengan studi kasus usaha nyata.

![Status](https://img.shields.io/badge/status-complete-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

🌐 **Live Demo:** [facarbon-inventory-system.vercel.app](https://facarbon-inventory-system.vercel.app/)

---

## 📖 Latar Belakang

Facarbon adalah usaha retail yang menjual aksesoris dan part Vespa matic berbahan carbon fiber (forged & twill). Sebelumnya, seluruh pencatatan stok dan keuangan dilakukan secara manual menggunakan Microsoft Excel, yang menimbulkan beberapa masalah:

- Tidak ada notifikasi otomatis saat stok kosong
- Rawan kesalahan input manual (human error)
- Pencatatan keuangan terpisah dari pencatatan stok
- Tidak ada gambaran visual/analitik yang cepat dibaca
- Sulit diakses bersama oleh lebih dari satu staf secara real-time

FIS dikembangkan untuk menjawab masalah-masalah tersebut dengan pendekatan sistem informasi yang lebih modern.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| 📦 **Manajemen Produk** | CRUD produk dengan atribut jenis carbon (forged/twill), kompatibilitas Vespa, dan 3 tingkat harga (modal, reseller, online) |
| 📥 **Stok Masuk** | Pencatatan penerimaan barang per kategori (pembelian/produksi), otomatis tercatat di modul keuangan |
| 📤 **Stok Keluar** | Pencatatan penjualan per channel (reseller/online/langsung) dengan harga yang dapat disesuaikan |
| 💰 **Keuangan** | Pencatatan otomatis dari transaksi stok + input manual, dengan ringkasan saldo bulanan/tahunan |
| 🧾 **Faktur** | Pembuatan invoice multi-item dengan nomor auto-generate, otomatis membuat stok keluar & catatan keuangan |
| 📊 **Dashboard & Analitik** | Visualisasi data stok dan keuangan dalam grafik interaktif |
| 🔔 **Notifikasi Stok Kosong** | Peringatan otomatis untuk produk dengan stok = 0 |
| 📑 **Import Excel** | Import data historis keuangan, stok masuk, dan stok keluar dari spreadsheet Excel (dengan preview sebelum konfirmasi) |
| 🌓 **Responsive Design** | Dapat diakses dari desktop maupun mobile |

---

## 🛠️ Tech Stack

**Frontend**
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-8884d8)
![Lucide](https://img.shields.io/badge/Icons-Lucide-F56565)

**Backend**
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![Sanctum](https://img.shields.io/badge/Auth-Sanctum-FF2D20)
![Excel](https://img.shields.io/badge/Excel-Maatwebsite_3.1-217346?logo=microsoftexcel&logoColor=white)

**Database & Tools**
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Laragon](https://img.shields.io/badge/Dev%20Env-Laragon-1E90FF)

**Deployment**
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend%20%26%20DB-Render-46E3B7?logo=render&logoColor=white)

---

## 🎨 Design System

Sistem menggunakan tema **dark mode** dengan aksen *gold carbon* yang merepresentasikan identitas brand Facarbon.

| Elemen | Warna |
|---|---|
| Background | `#0d0d0d` |
| Surface/Card | `#111111` |
| Aksen Utama | `#c8a96e` (gold) |
| Stok Tersedia | `#5a9e5a` (hijau) |
| Stok Kosong | `#e05a5a` (merah) |

**Tipografi:** Inter (UI), DM Sans (body), JetBrains Mono (angka, SKU, harga)

---

## 📸 Screenshot

> Tambahkan screenshot aplikasi di folder `docs/screenshots/` lalu update tautan di bawah ini.

| Login | Dashboard |
|---|---|
| ![Login](docs/screenshots/01-login.png) | ![Dashboard](docs/screenshots/02-dashboard.png) |

| Manajemen Produk | Stok Masuk/Keluar |
|---|---|
| ![Produk](docs/screenshots/03-products.png) | ![Stok](docs/screenshots/04-stock.png) |

| Keuangan | Faktur |
|---|---|
| ![Keuangan](docs/screenshots/05-finance.png) | ![Faktur](docs/screenshots/06-invoice.png) |

---

## 📂 Struktur Proyek

```
facarbon-inventory-system/
├── backend/              # Laravel 13 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # 9 controllers
│   │   ├── Middleware/               # SecurityHeaders
│   │   ├── Models/                   # 7 Eloquent models
│   │   ├── Imports/                  # Maatwebsite Excel importers
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   ├── migrations/              # 14 migrations
│   │   ├── factories/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php                  # 43 endpoints
│   ├── tests/Feature/Api/           # 42 PHPUnit tests
│   └── composer.json
├── frontend/             # React 19 + Vite 8 + TailwindCSS 4
│   ├── src/
│   │   ├── pages/                   # 12 pages (React.lazy)
│   │   ├── components/
│   │   ├── context/                 # Auth, Theme, Toast
│   │   ├── api/
│   │   └── utils/
│   ├── e2e/                         # Playwright smoke test
│   ├── vercel.json
│   └── package.json
├── docs/
│   ├── screenshots/
│   └── SRS_FIS_Facarbon_v1.1.docx
├── Dockerfile                        # Multi-stage (PHP 8.3 + node 22 + nginx)
├── docker-compose.yml                # mysql + backend + frontend
├── nginx.conf                        # SPA fallback + API proxy
├── render.yaml                       # Render deploy config
├── AGENTS.md
├── context.md
├── resource.md
├── .gitignore
└── README.md
```

---

## 🚀 Instalasi & Menjalankan Secara Lokal

### Prasyarat
- [Laragon](https://laragon.org/) (PHP 8.3+, MySQL 8+, Node.js 18+)
- Composer
- Git

### 1. Clone Repository
```bash
git clone https://github.com/pandjiSTR/facarbon-inventory-system.git
cd facarbon-inventory-system
```

### 2. Setup Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Sesuaikan konfigurasi database di `.env`, lalu jalankan migrasi:
```bash
php artisan migrate --seed
php artisan serve
# API tersedia di http://127.0.0.1:8000
```

### 3. Setup Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
# App tersedia di http://localhost:5173
```

### 4. Alternatif: Docker
```bash
docker-compose up -d
# Backend: http://localhost:8000
# Frontend: http://localhost
# MySQL: port 3306
```

### 5. Akun Default (Seeder)
| Role | Email | Password |
|---|---|---|
| Admin | admin@facarbon.com | facarbon123 |
| Staff | staff@facarbon.com | facarbon123 |

---

## 🌐 Deployment

| Layanan | Platform | Keterangan |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Auto-deploy dari branch `main` |
| Backend API | [Render](https://render.com) | Laravel REST API (PHP 8.3) |
| Database | [Render](https://render.com) | MySQL 8.0 |
| Docker | — | Opsional: `docker-compose up` (mysql + backend + frontend)

---

## 🗄️ Skema Database

| Tabel | Fungsi |
|---|---|
| `users` | Data pengguna sistem |
| `products` | Master data produk (24 SKU, FAC-001 s/d FAC-024) |
| `stock_in` | Transaksi stok masuk |
| `stock_out` | Transaksi stok keluar |
| `finances` | Pencatatan keuangan (otomatis & manual) |
| `invoices` | Header faktur penjualan |
| `invoice_items` | Detail item per faktur |

Dokumentasi lengkap (SRS) tersedia di [`docs/SRS_FIS_Facarbon.docx`](docs/SRS_FIS_Facarbon.docx).

---

## 🔌 API Endpoints (43 Endpoint, 42 Functional)

Semua endpoint (kecuali login) membutuhkan header `Authorization: Bearer {token}`.
Pagination: semua list endpoint menerima `?per_page=` (default 25, max 100).

### Auth (2 public + 2 protected)
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/login` | Login → return Sanctum token |
| POST | `/api/auth/register` | (route ada, controller tidak diimplementasi) |
| POST | `/api/auth/logout` | Logout (hapus token) |
| GET | `/api/auth/me` | Info user login |

### Dashboard (cached 5 menit)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/dashboard` | Stat cards, chart 6 bulan, alert stok, penjualan terbaru |

### Products (8)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/products` | List (paginate, filter: search/carbon_type/out_of_stock/is_active) |
| POST | `/api/products` | Tambah produk (upload foto, validasi dimensi) |
| GET | `/api/products/{id}` | Detail + 5 riwayat stok terakhir |
| PUT | `/api/products/{id}` | Edit produk |
| DELETE | `/api/products/{id}` | Soft-delete (hanya jika stok = 0) |
| PATCH | `/api/products/{id}/toggle-active` | Aktif/nonaktifkan produk |
| GET | `/api/products/{id}/stock-history` | Semua riwayat stok produk |
| GET | `/api/products/export` | Export CSV seluruh produk |

### Stock In (5 — no update)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/stock-in` | List (paginate, filter: product_id/category/date) |
| POST | `/api/stock-in` | Catat + update stok + auto finance debit |
| GET | `/api/stock-in/{id}` | Detail |
| DELETE | `/api/stock-in/{id}` | Hard-delete + hapus finance + recalculate stok |
| GET | `/api/stock-in/export` | Export CSV |

### Stock Out (5 — no update)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/stock-out` | List (paginate, filter: product_id/channel/date) |
| POST | `/api/stock-out` | Cek stok → catat + update stok + auto finance kredit |
| GET | `/api/stock-out/{id}` | Detail |
| DELETE | `/api/stock-out/{id}` | Hard-delete + hapus finance + recalculate stok |
| GET | `/api/stock-out/export` | Export CSV |

### Finances (5)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/finances` | List (paginate, filter: type/category/date) + meta total |
| POST | `/api/finances` | Entry manual (operasional, lain-lain) |
| GET | `/api/finances/{id}` | Detail |
| GET | `/api/finances/summary` | Summary per tahun/bulan per category+type |
| GET | `/api/finances/export` | Export CSV |

### Invoices (4 — no update)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/invoices` | List (paginate, filter: status/buyer_name/date) |
| POST | `/api/invoices` | Buat invoice + items + stock_out + finance (1 transaction) |
| GET | `/api/invoices/{id}` | Detail + items + user + stockOuts |
| DELETE | `/api/invoices/{id}` | Hapus cascade: items + stockOut + finance + recalculate |

### Users (5)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/users` | List semua user |
| POST | `/api/users` | Buat user baru |
| GET | `/api/users/{id}` | Detail user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Hapus user (tidak bisa hapus diri sendiri) |

### Import Excel (6 — 2-step: preview → confirm)
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/import/finance/preview` | Preview import Excel keuangan |
| POST | `/api/import/finance/confirm` | Bulk insert finance |
| POST | `/api/import/stock-in/preview` | Preview import stok masuk |
| POST | `/api/import/stock-in/confirm` | Bulk insert + update stok + finance debit |
| POST | `/api/import/stock-out/preview` | Preview import stok keluar |
| POST | `/api/import/stock-out/confirm` | Per-record transaction (skip jika stok kurang) |

---

## 🗺️ Roadmap

- [x] Penyusunan SRS
- [x] Backend API (Laravel + Sanctum) — 43 endpoint (42 functional)
- [x] Frontend (React + Tailwind) — 12 halaman
- [x] Fitur import Excel (keuangan, stok masuk, stok keluar)
- [x] Cetak faktur ke PDF
- [x] Deployment online (Vercel + Render)
- [ ] Mobile responsive (PWA)

---

## 👥 Tim Pengembang

| Nama | NIM | GitHub |
|---|---|---|
| Mohammad Panji Satrio | 13240019 | [@pandjiSTR](https://github.com/pandjiSTR) |
| Anaya Bintang Prawidya | 13240011 | [@fleurdes0ir](https://github.com/fleurdes0ir) |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik. Bebas digunakan sebagai referensi pembelajaran.
