# FIS_CONTEXT — Facarbon Inventory System
> Single source of truth untuk sesi vibecoding FIS.
> Update setiap kali ada perubahan besar pada arsitektur atau API.
> Last updated: Juni 2026

---

## 1. Identitas Proyek

| Info | Detail |
|------|--------|
| Nama | Facarbon Inventory System (FIS) |
| Tipe | Web app inventori & keuangan toko aksesoris carbon Vespa matic |
| Versi | 1.0 |
| Repo | https://github.com/pandjiSTR/facarbon-inventory-system |
| Live Frontend | https://facarbon-inventory-system.vercel.app |
| Live Backend | https://facarbon-backend.onrender.com |

**Tim:**
- Mohammad Panji Satrio (pandjiSTR) — integrator, backend
- Anaya Bintang Prawidya (fleurdes0ir) — frontend

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13 + PHP 8.3 |
| Frontend | React 19 + Vite 8 |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8.0 |
| Styling | TailwindCSS 4 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Excel Import | Maatwebsite/Laravel-Excel 3.1 |
| PDF Print | react-to-print |
| Local Dev | Laragon (PHP 8.3, MySQL 8, Node 18+) |
| Deploy FE | Vercel (auto-deploy dari branch `main`) |
| Deploy BE | Render (auto-deploy dari branch `main`) |

---

## 3. Design System

**Tema:** Dark mode default, toggle light mode via `.light` class di `<html>`

### Warna
| Elemen | Dark | Light |
|--------|------|-------|
| Background | `#0d0d0d` | `#f4f4f5` |
| Surface/Card | `#111111` | `#ffffff` |
| Border | `#1e1e1e` | `#e4e4e7` |
| Aksen Gold | `#c8a96e` | `#b8894e` |
| Stok Tersedia | `#5a9e5a` | `#16a34a` |
| Stok Kosong | `#e05a5a` | `#dc2626` |
| Teks Utama | `#f0f0f0` | `#18181b` |
| Teks Sekunder | `#888888` | `#52525b` |

### Font
- **Inter** — UI (nav, label, tombol)
- **DM Sans** — Body (paragraf, form, deskripsi)
- **JetBrains Mono** — Angka/SKU (harga, stok, SKU, nomor invoice)

CSS variables full theming, transisi smooth antar mode.

---

## 4. Struktur Monorepo

```
facarbon-inventory-system/
├── backend/                        ← Laravel 13 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ProductController.php
│   │   │   ├── StockInController.php
│   │   │   ├── StockOutController.php
│   │   │   ├── FinanceController.php
│   │   │   ├── InvoiceController.php
│   │   │   └── ImportController.php
│   │   ├── Models/
│   │   │   ├── User.php            (HasApiTokens, HasFactory)
│   │   │   ├── Product.php         (SoftDeletes)
│   │   │   ├── StockIn.php
│   │   │   ├── StockOut.php
│   │   │   ├── Finance.php
│   │   │   ├── Invoice.php         (SoftDeletes)
│   │   │   └── InvoiceItem.php
│   │   ├── Imports/                (Maatwebsite Excel importers)
│   │   │   ├── FinanceImport.php
│   │   │   ├── StockInImport.php
│   │   │   ├── StockOutImport.php
│   │   │   └── ProductImport.php
│   │   └── Providers/
│   │       └── AppServiceProvider.php
│   ├── config/
│   │   ├── cors.php                ← Vercel domain di allowed_origins
│   │   ├── sanctum.php
│   │   └── excel.php
│   ├── database/
│   │   ├── migrations/             (11 file migrasi)
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── UserSeeder.php
│   │       └── ProductSeeder.php
│   ├── routes/
│   │   └── api.php                 ← 32 endpoint
│   ├── .env                        ← DB, APP_URL, SANCTUM_STATEFUL_DOMAINS
│   ├── composer.json
│   └── Dockerfile + nginx.conf     ← (opsional, untuk Render)
│
├── frontend/                       ← React 19 + Vite 8
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── StockIn.jsx
│   │   │   ├── StockOut.jsx
│   │   │   ├── Finances.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Transactions.jsx    ← frontend-only aggregation
│   │   │   ├── Reports.jsx
│   │   │   └── Import.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx   (Sidebar + Outlet)
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── import/
│   │   │   │   ├── Dropzone.jsx
│   │   │   │   ├── ImportFinanceTab.jsx
│   │   │   │   ├── ImportStockInTab.jsx
│   │   │   │   ├── ImportStockOutTab.jsx
│   │   │   │   └── ResultBanner.jsx
│   │   │   └── ui/                 ← (available for shared components)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     (login/logout, localStorage)
│   │   │   └── ThemeContext.jsx    (dark/light toggle)
│   │   ├── api/
│   │   │   └── axios.js            ← Axios instance + interceptors
│   │   ├── hooks/                  ← (available for custom hooks)
│   │   ├── assets/
│   │   │   ├── logo-facarbon-dark.png
│   │   │   └── logo-facarbon-white.png
│   │   ├── index.css               ← CSS variables, Tailwind import
│   │   ├── App.jsx                 ← Router setup
│   │   └── main.jsx                ← Entry point
│   ├── .env                        ← VITE_API_URL=http://127.0.0.1:8000/api
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── screenshots/
│   └── SRS_FIS_Facarbon_v1.1.docx
├── context.md                      ← file ini
├── README.md
└── .gitignore
```

---

## 5. Axios Pattern (WAJIB DIIKUTI)

File: `frontend/src/api/axios.js`

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

// Request interceptor — inject Bearer token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — redirect ke /login on 401
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

export default api
```

**Cara pakai di komponen:**
```javascript
import api from '../api/axios'

// GET
const res = await api.get('/products')

// POST
const res = await api.post('/stock-in', payload)

// Upload file (multipart)
const formData = new FormData()
formData.append('photo', file)
const res = await api.post(`/products/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

---

## 6. Business Rules (JANGAN DILANGGAR)

| # | Aturan |
|---|--------|
| 1 | `current_stock` TIDAK pernah diinput manual — selalu dihitung dari `SUM(stock_in) - SUM(stock_out)` via method `recalculateStock()` |
| 2 | Setiap stok masuk OTOMATIS membuat record finance (debit) |
| 3 | Setiap stok keluar OTOMATIS membuat record finance (kredit) |
| 4 | Membuat invoice OTOMATIS membuat stock_out + record finances dalam 1 DB transaction |
| 5 | Alert stok aktif saat `current_stock = 0` (bukan low stock, meski ada field min_stock) |
| 6 | Produk menggunakan soft delete — hanya bisa dihapus jika `current_stock = 0` |
| 7 | Nama & harga produk di invoice disimpan sebagai snapshot (`product_name`, `product_sku`) — tidak terpengaruh jika produk diedit |
| 8 | Tidak ada role-based access control — semua user setara (admin/staff bisa akses semua) |
| 9 | Harga jual di stok keluar bisa berbeda dari harga katalog (fleksibel per transaksi) |
| 10 | Stock-out yang terhubung ke invoice ikut terhapus jika invoice dihapus |
| 11 | Import stock-out menggunakan per-record transaction: skip jika stok kurang (tidak rollback semua) |

---

## 7. Database Schema

### Tabel & Fungsi
| Tabel | Fungsi |
|---|---|
| `users` | Auth & role (admin/staff), hashed password, Sanctum tokens |
| `products` | Master produk: SKU, nama, carbon_type, vespa_compatibility (JSON), 3 harga, current_stock, photo, softDeletes |
| `stock_in` | Stok masuk: qty, modal_price, category (pembelian_stok/produksi), date, FK product & user |
| `stock_out` | Stok keluar: qty, channel (reseller/online/langsung), sell_price, invoice_id nullable, date |
| `invoices` | Faktur: invoice_number auto, buyer_name, total_amount, status (draft/confirmed/paid), softDeletes |
| `invoice_items` | Item faktur: snapshot product_name & product_sku, qty, unit_price, subtotal auto |
| `finances` | Buku kas: type (debit/kredit), amount, category, FK ke stock_in / stock_out nullable |
| `personal_access_tokens` | Sanctum tokens (morph ke User) |
| `cache` / `cache_locks` | System cache |

### Detail Kolom per Tabel

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | Auto |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | UNIQUE |
| password | VARCHAR(255) | Hashed |
| role | ENUM('admin','staff') | Default 'staff' |
| is_active | BOOLEAN | Default true |
| timestamps | | |

**products**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| sku | VARCHAR(20) | UNIQUE, FAC-XXX |
| name | VARCHAR(255) | Nama produk |
| carbon_type | ENUM('forged','twill') | Jenis carbon |
| vespa_compatibility | JSON | Array model Vespa |
| modal_price | BIGINT UNSIGNED | Harga modal |
| reseller_price | BIGINT UNSIGNED | Harga reseller |
| online_price | BIGINT UNSIGNED | Nullable |
| current_stock | INTEGER | Default 0, auto-calculate |
| photo | VARCHAR(255) | Nullable, path file |
| is_active | BOOLEAN | Default true |
| timestamps | | |
| deleted_at | TIMESTAMP | SoftDeletes |

**stock_in**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| product_id | BIGINT UNSIGNED | FK → products, CASCADE |
| user_id | BIGINT UNSIGNED | FK → users |
| quantity | INT UNSIGNED | |
| modal_price | BIGINT UNSIGNED | Harga beli per unit |
| category | ENUM('pembelian_stok','produksi') | |
| date | DATE | Tanggal transaksi |
| notes | TEXT | Nullable |
| timestamps | | |

**stock_out**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| product_id | BIGINT UNSIGNED | FK → products, CASCADE |
| user_id | BIGINT UNSIGNED | FK → users |
| quantity | INT UNSIGNED | |
| channel | ENUM('reseller','online','langsung') | |
| sell_price | BIGINT UNSIGNED | Harga jual actual |
| invoice_id | BIGINT UNSIGNED | FK → invoices, SET NULL, nullable |
| date | DATE | |
| notes | TEXT | Nullable |
| timestamps | | |

**invoices**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| invoice_number | VARCHAR(30) | UNIQUE, auto INV/YYYY/NNN |
| user_id | BIGINT UNSIGNED | FK → users |
| buyer_name | VARCHAR(255) | |
| buyer_contact | VARCHAR(255) | Nullable |
| date | DATE | |
| total_amount | BIGINT UNSIGNED | Auto dari sum items |
| status | ENUM('draft','confirmed','paid') | Default 'confirmed' |
| notes | TEXT | Nullable |
| timestamps | | |
| deleted_at | TIMESTAMP | SoftDeletes |

**invoice_items**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| invoice_id | BIGINT UNSIGNED | FK → invoices, CASCADE |
| product_id | BIGINT UNSIGNED | FK → products, SET NULL, nullable |
| product_name | VARCHAR(255) | Snapshot |
| product_sku | VARCHAR(20) | Snapshot, nullable |
| quantity | INT UNSIGNED | |
| unit_price | BIGINT UNSIGNED | |
| subtotal | BIGINT UNSIGNED | Auto = qty × unit_price |
| timestamps | | |

**finances**
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT UNSIGNED PK | |
| user_id | BIGINT UNSIGNED | FK → users |
| stock_in_id | BIGINT UNSIGNED | FK → stock_in, SET NULL, nullable |
| stock_out_id | BIGINT UNSIGNED | FK → stock_out, SET NULL, nullable |
| date | DATE | |
| description | VARCHAR(255) | |
| category | ENUM('pembelian_stok','produksi','penjualan','operasional','lain_lain') | |
| type | ENUM('debit','kredit') | |
| amount | BIGINT UNSIGNED | |
| notes | TEXT | Nullable |
| timestamps | | |

### Relasi Kunci
```
User ──hasMany──> StockIn ──belongsTo──> Product
User ──hasMany──> StockOut ──belongsTo──> Product
User ──hasMany──> Invoice ──hasMany──> InvoiceItem ──belongsTo──> Product
User ──hasMany──> Finance
                     ├──belongsTo──> StockIn (optional)
                     └──belongsTo──> StockOut (optional)
Invoice ──hasMany──> StockOut (optional)
StockIn ──hasOne──> Finance (debit)
StockOut ──hasOne──> Finance (kredit)
```

---

## 8. API Endpoints (32 Endpoint)

Base URL: `http://127.0.0.1:8000/api` (local) / `https://facarbon-backend.onrender.com/api` (production)
Auth: `Authorization: Bearer {token}` — semua endpoint kecuali login & register

### Auth (2 public, 2 protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login, return Sanctum token |
| POST | `/auth/register` | Register user baru |
| POST | `/auth/logout` | Hapus token aktif |
| GET | `/auth/me` | Info user saat ini |

### Dashboard (1)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/dashboard` | Statistik produk, stok, keuangan, invoice, alert, penjualan terbaru |

### Products (7)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/products` | List produk (filter: carbon_type, vespa, is_active, out_of_stock, search, low_stock) |
| POST | `/products` | Tambah produk (dengan upload foto) |
| GET | `/products/{id}` | Detail produk + 5 riwayat stok terakhir |
| PUT | `/products/{id}` | Update produk |
| DELETE | `/products/{id}` | Soft-delete (hanya jika stok = 0) |
| PATCH | `/products/{id}/toggle-active` | Toggle aktif/nonaktif |
| GET | `/products/{id}/stock-history` | Semua riwayat stock-in/out |

### Stock In (4)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/stock-in` | List (filter: product_id, category, date_range) |
| POST | `/stock-in` | Catat + update stok + auto finance debit |
| GET | `/stock-in/{id}` | Detail |
| DELETE | `/stock-in/{id}` | Hapus + hapus finance + recalculate stok |

### Stock Out (4)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/stock-out` | List (filter: product_id, channel, date_range) |
| POST | `/stock-out` | Cek stok → catat + update stok + auto finance kredit |
| GET | `/stock-out/{id}` | Detail |
| DELETE | `/stock-out/{id}` | Hapus + hapus finance + recalculate stok |

### Finances (4)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/finances` | List (filter: type, category, date_range) + meta total kredit/debit/saldo |
| POST | `/finances` | Entry manual (operasional, dll) |
| GET | `/finances/{id}` | Detail |
| GET | `/finances/summary` | Ringkasan per tahun/bulan per category+type |

### Invoices (4)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/invoices` | List (filter: status, buyer_name, date_range) |
| POST | `/invoices` | Buat invoice + items + stock_out + finance (1 transaction) |
| GET | `/invoices/{id}` | Detail dengan items, user, stockOuts |
| DELETE | `/invoices/{id}` | Hapus invoice + items + stock_out + finance + recalculate stok |

### Import Excel (6) — 2-step: preview → confirm
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/import/finance/preview` | Preview import Excel keuangan |
| POST | `/import/finance/confirm` | Bulk insert finance |
| POST | `/import/stock-in/preview` | Preview import stock-in |
| POST | `/import/stock-in/confirm` | Bulk insert + update stok + finance debit |
| POST | `/import/stock-out/preview` | Preview import stock-out |
| POST | `/import/stock-out/confirm` | Per-record transaction (skip jika stok kurang) + finance kredit |

---

## 9. Status Halaman Frontend

| Halaman | Route | Status | Notes |
|---------|-------|--------|-------|
| Login | `/login` | ✅ Selesai | Form login dengan email + password |
| Dashboard | `/dashboard` | ✅ Selesai | Stat cards, bar/line chart, alert stok, penjualan terbaru |
| Produk | `/products` | ✅ Selesai | Tabel + filter (carbon_type, search, status) |
| Tambah/Edit Produk | `/products/create`, `/products/:id/edit` | ✅ Selesai | Form dengan upload foto |
| Stok Masuk | `/stock-in` | ✅ Selesai | Form catat stok masuk + riwayat |
| Stok Keluar | `/stock-out` | ✅ Selesai | Form catat stok keluar + riwayat |
| Keuangan | `/finances` | ✅ Selesai | Buku kas + ringkasan saldo |
| Faktur | `/invoices` | ✅ Selesai | Buat & kelola invoice multi-item |
| Riwayat Transaksi | `/transactions` | ✅ Selesai | Aggregasi frontend dari 3 endpoint |
| Laporan | `/reports` | ✅ Selesai | Halaman laporan |
| Import Excel | `/import` | 🔧 In Progress | Dropzone + preview + confirm |
| Mobile Responsive | - | 🔧 In Progress | |

---

## 10. Context & State Management

### AuthContext (`context/AuthContext.jsx`)
- **State:** `user` (from localStorage), `loading`
- **Actions:** `login(email, password)` → return `{success, message}`, `logout()`
- **Expose:** `{user, login, logout, loading, isAuthenticated}`
- **Hook:** `useAuth()`
- **Storage:** `auth_token` + `auth_user` di localStorage

### ThemeContext (`context/ThemeContext.jsx`)
- **State:** `theme` ('dark'/'light') dari localStorage
- **Actions:** `toggle()`
- **Expose:** `{theme, toggle, isDark}`
- **Hook:** `useTheme()`
- **Effect:** Toggle `.light` class di `<html>`

### Layout Components
| Komponen | File | Fungsi |
|----------|------|--------|
| AppLayout | `components/layout/AppLayout.jsx` | Sidebar + Outlet, fetch lowStockCount |
| Sidebar | `components/layout/Sidebar.jsx` | Nav items, low stock badge, theme toggle, user info, logout |
| ProtectedRoute | `components/layout/ProtectedRoute.jsx` | Redirect ke /login jika !isAuthenticated |

---

## 11. Fitur Utama

1. **CRUD Produk** — upload foto, soft delete (hanya jika stok 0), toggle aktif/nonaktif
2. **Stok Masuk** — kategori pembelian_stok/produksi, otomatis update stok + catat finance debit
3. **Stok Keluar** — channel reseller/online/langsung, validasi stok, catat finance kredit
4. **Invoice Multi-Item** — auto stock-out + finance dalam 1 DB transaction
5. **Dashboard Analitik** — stat cards, bar chart (stok), line chart (keuangan), alert stok kosong, penjualan terbaru
6. **Import Excel** — preview sebelum confirm untuk finance, stock-in, stock-out
7. **Dark/Light Theme** — toggle dengan persist localStorage
8. **Riwayat Transaksi** — aggregasi frontend dari stock-in, stock-out, finance

---

## 12. Seed Data

### Users (2)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@facarbon.com | facarbon123 |
| Staff | staff@facarbon.com | facarbon123 |

### Products (24)
SKU FAC-001 sampai FAC-024, parts Vespa carbon fiber (forged/twill):
- Horn Cover, Mini Shield, Spark Plug Cover, Spoiler Plug, Mounting Cover
- Rem Handle Set, Shock Cover, Fork Cover, Glovebox Cup
- Kompatibel dengan Sprint / LX / Universal / S Facelift / Sprint 2024/2025
- Price range: modal Rp49.900–Rp448.500, reseller Rp58.000–Rp516.000
- Initial stock: 0–4 per produk

---

## 13. Local Development

```bash
# Backend (port 8000)
cd backend
cp .env.example .env        # sesuaikan DB credentials
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend (port 5173)
cd frontend
npm install
npm run dev
```

**Environment:**
- Backend `.env` → `DB_DATABASE=facarbon_db`, `DB_USERNAME=root`, `DB_PASSWORD=`
- Frontend `.env` → `VITE_API_URL=http://127.0.0.1:8000/api`
- Laragon: MySQL 8 running on port 3306
- SANCTUM_STATEFUL_DOMAINS: localhost:5173, localhost:3000, 127.0.0.1:5173

**Local dev sharing (test dari HP/external):**
```bash
# Backend
cloudflared tunnel --url http://localhost:8000

# Frontend — tambahkan di vite.config.js:
#   allowedHosts: ['.trycloudflare.com'],
#   host: true
```

---

## 14. Deployment

| Layanan | Platform | Keterangan |
|---------|----------|------------|
| Frontend | Vercel | Auto-deploy dari branch `main`, domain: facarbon-inventory-system.vercel.app |
| Backend API | Render | Laravel REST API, domain: facarbon-backend.onrender.com |
| Database | Render MySQL | MySQL 8 |

**CORS:** Vercel domain sudah ditambahkan ke `backend/config/cors.php` → `allowed_origins`.

**Foto produk:** Disimpan di `storage/app/public/products/`, diakses via `/storage/products/filename.jpg`. Field `photo_url` di response berupa full URL.

**Invoice number format:** `INV/YYYY/NNN` (contoh: `INV/2026/001`), di-generate otomatis backend.

**Git workflow:** Conventional commits. Branch `main` = production. Push ke main = auto-deploy ke Vercel & Render.

---

## 15. Hal-hal Teknis Penting

- **Halaman Transactions:** Dibangun pure frontend dengan mengaggregasi data dari 3 endpoint: `/stock-in` + `/stock-out` + `/finances`, tanpa endpoint backend khusus.
- **Stock-out yang terhubung ke invoice:** Jika invoice dihapus, stock-out terkait ikut terhapus (cascade dalam 1 transaction).
- **Import Excel format:** Finance → kolom `Tanggal`, `Keterangan`, `Debit`, `Kredit`. Stock in/out → kolom `Tanggal`, `ITEM`, `MATERIAL`, `CARBON TYPE`, `QTY`.
- **Route patterns:** `apiResource` dengan `except(['update'])` untuk stock-in, stock-out, invoices (no update allowed — histori tidak bisa diubah).
- **All controllers** menggunakan DB transaction untuk operasi multi-tabel.

---

## 16. OpenCode Project Config — Agent & Skill (Juni 2026)

Project-level OpenCode configuration di `.opencode/` folder root proyek. Di-load otomatis oleh OpenCode dan di-merge dengan global config.    

### Struktur Folder
```
.opencode/
├── opencode.json                    ← Project-level config (merge dengan global)
├── agents/
│   └── fis-security-reviewer.md     ← Sub-agent prompt
└── skills/
    └── fis-security/
        └── SKILL.md                 ← Skill checklist
```

### Agent: `fis-security-reviewer`
| Atribut | Value |
|---------|-------|
| Mode | `subagent` |
| Role | Security reviewer spesifik FIS |
| Tools | `read`, `bash`, `grep`, `glob` (no write/edit) |
| Dipanggil via | `/fis-security` command atau manual dari Plan/Build |

**Cara pakai:**
```
/fis-security review controllers
/fis-security scan sebelum commit
/fis-security full
```

### Skill: `fis-security`
- **File:** `.opencode/skills/fis-security/SKILL.md`
- **Di-load otomatis** via `instructions` di `opencode.json`
- Isi: checklist keamanan cepat, pola aman Laravel/React, area kritis finansial, pre-deployment checklist
- Tidak perlu invoke — selalu tersedia di context selama sesi

### Config (`opencode.json`)
```json
{
  "instructions": [".opencode/skills/fis-security/SKILL.md"],
  "agent": {
    "fis-security-reviewer": {
      "mode": "subagent",
      "prompt": "{file:.opencode/agents/fis-security-reviewer.md}",
      "tools": { "read": true, "bash": true, "grep": true, "glob": true }
    }
  },
  "command": {
    "fis-security": { "agent": "fis-security-reviewer", "subtask": true }
  }
}
```

### Review Coverage
| Area | Tools |
|------|-------|
| Dependency PHP | `composer audit` |
| Dependency JS | `npm audit` |
| Hardcoded secrets | Grep `.env`, config, controllers |
| Route auth middleware | Read `routes/api.php` |
| Mass assignment | Read Models `$fillable` / `$guarded` |
| SQL injection risk | Grep `DB::raw`, `whereRaw` |
| DB transaction | Grep `DB::transaction`, `beginTransaction` |
| File upload validation | Read ProductController |
