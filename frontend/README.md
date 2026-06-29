# Facarbon Inventory System — Frontend (React 19 + Vite 8)

SPA frontend untuk FIS, dibangun dengan React 19 + Vite 8 + TailwindCSS 4.

## Tech

- **React 19** — UI library dengan code splitting (12 lazy-loaded pages)
- **React Router 7** — Client-side routing
- **Vite 8** — Build tool & dev server
- **TailwindCSS 4** — Utility-first CSS via Vite plugin
- **Recharts 3** — Charting (BarChart, LineChart, PieChart)
- **Lucide React** — SVG icons
- **Axios** — HTTP client dengan Bearer token interceptor

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run lint       # ESLint
npm run preview    # preview production build
```

## Pages

12 halaman: Login, Dashboard, Products, ProductForm, StockIn, StockOut, Finances, Invoices, Transactions, Reports, Import, Users. Semua `React.lazy()` — main bundle 241KB.

> Proyek ini bagian dari monorepo FIS. Lihat `../README.md` untuk dokumentasi lengkap.
