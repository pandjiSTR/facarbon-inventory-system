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
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-8884d8)

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
│   ├── database/
│   └── routes/
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   └── public/
├── docs/
│   ├── screenshots/
│   └── SRS_FIS_Facarbon.docx
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

### 4. Akun Default (Seeder)
| Role | Email | Password |
|---|---|---|
| Admin | admin@facarbon.com | facarbon123 |
| Staff | staff@facarbon.com | facarbon123 |

---

## 🌐 Deployment

| Layanan | Platform | Keterangan |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Auto-deploy dari branch `main` |
| Backend API | [Render](https://render.com) | Laravel REST API |
| Database | [Render](https://render.com) | MySQL 8 |

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

## 🔌 API Endpoints (32 Endpoint)

Semua endpoint protected membutuhkan header `Authorization: Bearer {token}`

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Info user login |
| GET | `/api/dashboard` | Data dashboard |
| GET/POST | `/api/products` | List & tambah produk |
| GET/PUT/DELETE | `/api/products/{id}` | Detail, edit, hapus |
| PATCH | `/api/products/{id}/toggle-active` | Aktif/nonaktif produk |
| GET | `/api/products/{id}/stock-history` | Riwayat stok produk |
| GET/POST | `/api/stock-in` | List & catat stok masuk |
| GET/DELETE | `/api/stock-in/{id}` | Detail & hapus stok masuk |
| GET/POST | `/api/stock-out` | List & catat stok keluar |
| GET/DELETE | `/api/stock-out/{id}` | Detail & hapus stok keluar |
| GET/POST | `/api/finances` | List & entry manual keuangan |
| GET | `/api/finances/summary` | Summary keuangan |
| GET | `/api/finances/{id}` | Detail catatan keuangan |
| GET/POST | `/api/invoices` | List & buat invoice |
| GET/DELETE | `/api/invoices/{id}` | Detail & hapus invoice |
| POST | `/api/import/finance/preview` | Preview import keuangan |
| POST | `/api/import/finance/confirm` | Konfirmasi import keuangan |
| POST | `/api/import/stock-in/preview` | Preview import stok masuk |
| POST | `/api/import/stock-in/confirm` | Konfirmasi import stok masuk |
| POST | `/api/import/stock-out/preview` | Preview import stok keluar |
| POST | `/api/import/stock-out/confirm` | Konfirmasi import stok keluar |

---

## 🗺️ Roadmap

- [x] Penyusunan SRS
- [x] Backend API (Laravel + Sanctum) — 32 endpoint
- [x] Frontend (React + Tailwind) — 10 halaman
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
