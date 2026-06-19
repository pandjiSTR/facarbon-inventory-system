# 🛵 Facarbon Inventory System (FIS)

Sistem manajemen inventori & keuangan berbasis web untuk **Facarbon** — toko aksesoris carbon Vespa matic. Dibangun untuk menggantikan pencatatan manual berbasis Excel dengan sistem yang lebih terstruktur, otomatis, dan interaktif.

> 🎓 Proyek ini dikembangkan sebagai tugas kuliah dengan studi kasus usaha nyata.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

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
| 📥 **Stok Masuk** | Pencatatan penerimaan barang, otomatis tercatat di modul keuangan |
| 📤 **Stok Keluar** | Pencatatan penjualan per channel (reseller/online) dengan harga yang dapat disesuaikan |
| 💰 **Keuangan** | Pencatatan otomatis dari transaksi stok + input manual, dengan ringkasan saldo |
| 🧾 **Faktur** | Pembuatan invoice/faktur penjualan yang dapat diekspor ke PDF |
| 📊 **Dashboard & Analitik** | Visualisasi data stok dan keuangan dalam grafik interaktif |
| 🔔 **Notifikasi Stok Kosong** | Peringatan otomatis untuk produk dengan stok = 0 |
| 📑 **Import Excel** | Migrasi data produk dari spreadsheet Excel yang sudah ada |
| 🌓 **Responsive Design** | Dapat diakses dari desktop maupun mobile |

---

## 🛠️ Tech Stack

**Frontend**
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-8884d8)

**Backend**
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)
![Sanctum](https://img.shields.io/badge/Auth-Sanctum-FF2D20)

**Database & Tools**
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Laragon](https://img.shields.io/badge/Dev%20Env-Laragon-1E90FF)

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
├── backend/              # Laravel REST API
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
- [Laragon](https://laragon.org/) (PHP 8.2+, MySQL 8+, Node.js 18+)
- Composer
- Git

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/facarbon-inventory-system.git
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
```

### 3. Setup Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Akses Aplikasi
Buka browser ke `http://localhost:5173` (atau sesuai port yang ditampilkan).

---

## 🗄️ Skema Database (Ringkasan)

| Tabel | Fungsi |
|---|---|
| `users` | Data pengguna sistem |
| `products` | Master data produk |
| `stock_in` | Transaksi stok masuk |
| `stock_out` | Transaksi stok keluar |
| `finances` | Pencatatan keuangan |
| `invoices` & `invoice_items` | Data faktur penjualan |

Dokumentasi lengkap (SRS) tersedia di [`docs/SRS_FIS_Facarbon.docx`](docs/SRS_FIS_Facarbon.docx).

---

## 🗺️ Roadmap

- [x] Penyusunan SRS
- [x] Backend API (Laravel + Sanctum)
- [x] Frontend (React + Tailwind)
- [x] Fitur import Excel
- [x] Cetak faktur ke PDF
- [x] Deployment online (Live Production via Render + Vercel)
- [ ] Implementasi PWA (Progressive Web App) untuk kemudahan akses mobile browser

---

## 👥 Tim Pengembang

| Nama | NIM | GitHub |
|---|---|---|
| Mohammad Panji Satrio | 13240019 | [@pandjiSTR](https://github.com/pandjiSTR) |
| Anaya Bintang Prawidya | 13240011 | [@fleurdes0ir](https://github.com/fleurdes0ir) |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik. Bebas digunakan sebagai referensi pembelajaran.
