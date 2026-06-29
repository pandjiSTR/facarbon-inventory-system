import { useState, useCallback, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, LayoutGrid, List, Download } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/ui/ProductCard'
import ProductDetailDrawer from '../components/ui/ProductDetailDrawer'
import ImageTooltip from '../components/ui/ImageTooltip'
import Badge from '../components/ui/Badge'
import StockBadge from '../components/ui/StockBadge'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import exportCSV from '../utils/exportCSV'

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '—'

const CARBON_TYPES = ['semua', 'twill', 'forged']
const CARBON_LABELS = { twill: 'Twill', forged: 'Forged' }

export default function Products() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [filterType, setFilterType] = useState('semua')
  const [filterStock, setFilterStock] = useState('semua')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [detailProduct, setDetailProduct] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })

  const buildParams = useCallback((pg, q, type, stock) => {
    const params = { page: pg, per_page: 25 }
    if (q) params.search = q
    if (type && type !== 'semua') params.carbon_type = type
    if (stock === 'kosong') params.out_of_stock = 1
    if (stock === 'tersedia') params.is_active = 1
    return params
  }, [])

  // React Query for data fetching with caching
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['products', page, deferredSearch, filterType, filterStock],
    queryFn: async () => {
      const params = buildParams(page, deferredSearch, filterType, filterStock)
      const res = await api.get('/products', { params })
      return res.data
    },
    staleTime: 1000 * 60 * 2, // Data fresh for 2 minutes
  })

  const products = data?.data || []
  const meta = data?.meta || {}

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleTypeChange = (t) => {
    setFilterType(t)
    setPage(1)
  }

  const handleStockChange = (s) => {
    setFilterStock(s)
    setPage(1)
  }

  const handlePageChange = (p) => {
    setPage(p)
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      // React Query will automatically refetch and update cache
    } catch {
      alert('Gagal menghapus produk')
    } finally {
      setDeleting(null)
      setConfirmDelete({ isOpen: false, id: null })
    }
  }

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      await api.patch(`/products/${id}/toggle-active`)
      // React Query will automatically refetch and update cache
    } catch {
      alert('Gagal mengubah status produk')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Produk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {meta.total || 0} produk total
            {meta.out_of_stock > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 8 }}>· {meta.out_of_stock} stok kosong</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/products/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', border: 'none', borderRadius: 8,
              padding: '9px 16px', cursor: 'pointer',
              color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Plus size={14} />
            Tambah Produk
          </button>
          <button
            onClick={() => exportCSV('/products/export', 'products.csv')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 16px', cursor: 'pointer',
              color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', gap: 12, alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama, SKU, kompatibilitas..."
            style={{
              width: '100%', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 10px 8px 30px',
              color: 'var(--text-primary)', fontSize: 13,
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {CARBON_TYPES.map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                background: filterType === t ? 'var(--accent)' : 'var(--bg-elevated)',
                color: filterType === t ? '#0d0d0d' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {t === 'semua' ? 'Semua' : CARBON_LABELS[t]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[['semua', 'Semua Stok'], ['kosong', 'Kosong'], ['tersedia', 'Tersedia']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleStockChange(val)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                background: filterStock === val
                  ? val === 'kosong' ? 'var(--red)' : val === 'tersedia' ? 'var(--green)' : 'var(--accent)'
                  : 'var(--bg-elevated)',
                color: filterStock === val ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            onClick={() => setViewMode('list')}
            title="Mode tabel"
            style={{
              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              background: viewMode === 'list' ? 'var(--accent)' : 'var(--bg-elevated)',
              color: viewMode === 'list' ? '#0d0d0d' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode('catalog')}
            title="Mode katalog"
            style={{
              padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              background: viewMode === 'catalog' ? 'var(--accent)' : 'var(--bg-elevated)',
              color: viewMode === 'catalog' ? '#0d0d0d' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {error ? (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--red)',
          fontSize: 13, fontFamily: 'Inter, sans-serif',
        }}>
          Gagal memuat data produk
        </div>
      ) : viewMode === 'list' ? (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : products.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Tidak ada produk ditemukan
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  {['SKU', 'Nama Produk', 'Carbon Type', 'Kompatibilitas', 'Harga Reseller', 'Harga Online', 'Stok', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 11, fontFamily: 'Inter, sans-serif',
                      fontWeight: 600, color: 'var(--text-muted)',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none',
                      opacity: p.is_active ? 1 : 0.5,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {p.sku}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <ImageTooltip src={p.photo_url} alt={p.name} onClick={() => setDetailProduct(p)}>
                        <span
                          onClick={() => setDetailProduct(p)}
                          style={{ cursor: 'pointer', borderBottom: '1px dashed var(--border)', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        >
                          {p.name}
                        </span>
                      </ImageTooltip>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Badge type={p.carbon_type} />
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                      {Array.isArray(p.vespa_compatibility) ? p.vespa_compatibility.join(", ") : p.vespa_compatibility}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
                        {fmt(p.reseller_price)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {fmt(p.online_price)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <StockBadge stock={p.current_stock} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={toggling === p.id}
                        title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        {p.is_active
                          ? <ToggleRight size={20} color="var(--green)" />
                          : <ToggleLeft size={20} color="var(--text-muted)" />
                        }
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          title="Edit"
                          style={{
                            background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)',
                            borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', color: 'var(--accent)',
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ isOpen: true, id: p.id })}
                          disabled={deleting === p.id}
                          title="Hapus"
                          style={{
                            background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)',
                            borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', color: 'var(--red)',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && <Pagination meta={meta} onPageChange={handlePageChange} />}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  background: 'var(--bg-elevated)', borderRadius: 10,
                  height: 200, animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Tidak ada produk ditemukan
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
            }}>
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(id) => navigate(`/products/${id}/edit`)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onShowDetail={setDetailProduct}
                  toggling={toggling}
                  deleting={deleting}
                />
              ))}
            </div>
          )}
          {!loading && products.length > 0 && <Pagination meta={meta} onPageChange={handlePageChange} />}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        message="Apakah Anda yakin ingin menghapus produk ini? Produk hanya bisa dihapus jika stok kosong."
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        loading={deleting === confirmDelete.id}
      />
      <ProductDetailDrawer
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(id) => navigate(`/products/${id}/edit`)}
      />
    </div>
  )
}
