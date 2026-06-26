# FIS — AGENTS.md

Monorepo: `backend/` (Laravel 13 API), `frontend/` (React 19 + Vite 8 + TailwindCSS 4).

## Commands

```bash
# Backend (Laravel)
composer install
php artisan key:generate             # after cp .env.example .env
php artisan migrate --seed           # seed: admin+faccarbon123, staff+faccarbon123
php artisan serve                    # http://127.0.0.1:8000
./vendor/bin/pint                    # code style fix (Laravel Pint)
php artisan test                     # runs Feature tests in tests/Feature/Api/
composer audit                       # check deps for CVEs

# Frontend (React)
npm run dev                          # http://localhost:5173
npm run build
npm run lint                         # ESLint (no type checker)
```

## Non-obvious architecture

- **No `update` routes** — StockIn, StockOut, Invoice use `apiResource(...)->except(['update'])`. History is immutable: create + delete only.
- **CI**: `.github/workflows/ci.yml` — runs backend tests + Pint + `composer audit`, frontend lint + build on push/PR to `main`.
- **No `.opencode/` on disk** — directory is gitignored; CONTEXT.md sections 16+ are aspirational.
- **No RBAC** — all users (`admin`/`staff` role) have identical permissions.
- **Tests added**: `tests/Feature/Api/` — Auth, Product, StockIn, StockOut, Invoice, Finance, Import feature tests with SQLite in-memory via `RefreshDatabase` (42 tests total).
- **Docker**: `docker-compose.yml` with mysql + backend + frontend services. `Dockerfile` multi-stage: backend (PHP 8.3), frontend-prod (nginx).

## Business rules (NEVER violate)

| # | Rule |
|---|------|
| 1 | `current_stock` is NEVER set directly. Always call `$product->recalculateStock()` after any stock mutation. |
| 2 | StockIn create → auto Finance debit. StockOut create → auto Finance kredit. |
| 3 | Invoice create → auto StockOut + Finance in ONE `DB::transaction()`. |
| 4 | Invoice delete → cascade-delete StockOut + Finance + recalculate stock. |
| 5 | Products use SoftDeletes; delete only allowed if `current_stock === 0`. |
| 6 | Invoice items store `product_name` / `product_sku` as snapshots — not affected by later product edits. |
| 7 | Stock-out sell_price can differ from product catalog price (per-transaction). |
| 8 | Import stock-out: per-record transaction with skip (not rollback) when stock insufficient. |

## Controller patterns

- Response shape: `{ success: bool, data: ..., message: string, meta?: ... }`
- ALL multi-table operations wrapped in `DB::beginTransaction()` / `DB::commit()` / `DB::rollBack()`.
- Eager-load relationships on list endpoints (e.g. `'product:id,sku,name'`).
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP) auto-applied to all API responses via `SecurityHeaders` middleware.
- API throttled at 60 req/min per user/IP. Login throttled at 5/min per email+IP.
- Sanctum tokens expire after 24h (`config/sanctum.php`).
- Product photo upload: `nullable|image|mimes:jpg,jpeg,png,webp|max:2048|dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000`.

## Frontend patterns

- **Axios:** `frontend/src/api/axios.js` — Bearer token from `localStorage('auth_token')`, 401 auto-redirects to `/login`.
- **Auth:** `useAuth()` from `context/useAuth.js` — login stores `auth_token` + `auth_user` in localStorage.
- **Theme:** `useTheme()` from `context/useTheme.js` — `.light` class on `<html>` toggles CSS variables.
- **Toast:** `useToast()` from `context/useToast.js` — `toast(msg, type, duration?)` with types `success|error|warning|info`.
- **API base URL:** `import.meta.env.VITE_API_URL` (default `http://127.0.0.1:8000/api`).
- All API calls use `api` from `../api/axios` — NOT raw `fetch` or another axios instance.
- **Code splitting:** All page routes use `React.lazy()` via `lazy(() => import('./pages/...'))` — each page is its own chunk.
- **Reusable UI components** in `src/components/ui/`: `StatCard`, `Badge`, `StockBadge`, `ProductCard`, `ProductDetailDrawer`, `ImageModal`, `ImageTooltip`, `ErrorBoundary`, `LoadingSkeleton` (CardSkeleton, TableSkeleton, ChartSkeleton).
- **Parallel fetch** pattern: use `Promise.all([...])` for independent API calls (Transactions, Reports pages).
- **Reports page** computes financials client-side from stock-in/stock-out data (no `/finances/summary` call).
- **Pagination:** All list endpoints (Products, StockIn, StockOut, Invoices, Finances) accept `?per_page=` (default 25, max 100). Response `meta` includes `current_page`, `last_page`, `per_page`.

## CSS & design

- CSS variables for theming in `index.css` — use `var(--bg-surface)`, `var(--accent)`, etc. NOT hardcoded colors.
- Font classes: `.font-ui` (Inter), `.font-body` (DM Sans), `.font-mono` (JetBrains Mono).
- `supports_credentials: false` in CORS config — token auth, no cookie-based SPA auth.

## DB money & enum values

- All prices/amounts stored as `BIGINT UNSIGNED` (rupiah, no decimal). **Never use float.**
- ENUM values (use exact strings):
  - `carbon_type`: `forged`, `twill`
  - `stock_in.category`: `pembelian_stok`, `produksi`
  - `stock_out.channel`: `reseller`, `online`, `langsung`
  - `finance.type`: `debit`, `kredit`
  - `finance.category`: `pembelian_stok`, `produksi`, `penjualan`, `operasional`, `lain_lain`
  - `invoice.status`: `draft`, `confirmed`, `paid`
- SKU format: `FAC-XXX`. Invoice format: `INV/YYYY/NNN` (auto-generated).
- `vespa_compatibility` is JSON array (cast to `array` in model).

## Env configuration

`.env.example` includes:
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- `VITE_API_URL=http://127.0.0.1:8000/api`

## Seed accounts

| Email | Password |
|-------|----------|
| admin@facarbon.com | facarbon123 |
| staff@facarbon.com | facarbon123 |

## Reference

Detailed context in `CONTEXT.md` (sections 5–8: Axios pattern, business rules, schema, API endpoints).
