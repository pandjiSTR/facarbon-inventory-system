import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle, LayoutGrid, List } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/ui/ProductCard'
import ProductDetailDrawer from '../components/ui/ProductDetailDrawer'
import ImageTooltip from '../components/ui/ImageTooltip'

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '—'

const CARBON_TYPES = ['semua', 'twill', 'forged', 'plain']
const CARBON_LABELS = { twill: 'Twill', forged: 'Forged', plain: 'Plain' }

function Badge({ type }) {
  const styles = {
    twill:  { color: '#a0c4ff', bg: 'rgba(160,196,255,0.08)' },
    forged: { color: 'var(--accent)', bg: 'var(--accent-bg)' },
    plain:  { color: '#b0b0b0', bg: 'rgba(176,176,176,0.08)' },
  }
  const s = styles[type] || styles.plain
  return (
    <span style={{
      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
      color: s.color, background: s.bg,
      padding: '2px 8px', borderRadius: 4,
    }}>
      {CARBON_LABELS[type] || type}
    </span>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
      color: 'var(--red)', background: 'var(--red-bg)',
      padding: '2px 8px', borderRadius: 4,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <AlertCircle size={10} /> KOSONG
    </span>
  )
  if (stock <= 2) return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
      color: '#e0a85a', background: 'rgba(224,168,90,0.08)',
      padding: '2px 8px', borderRadius: 4,
    }}>
      {stock}
    </span>
  )
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
      color: 'var(--green)', background: 'var(--green-bg)',
      padding: '2px 8px', borderRadius: 4,
    }}>
      {stock}
    </span>
  )
}

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('semua')
  const [filterStock, setFilterStock] = useState('semua') // semua | kosong | tersedia
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [detailProduct, setDetailProduct] = useState(null)

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products')
      .then(res => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.vespa_compatibility.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'semua' || p.carbon_type === filterType
      const matchStock =
        filterStock === 'semua' ? true :
        filterStock === 'kosong' ? p.current_stock === 0 :
        p.current_stock > 0
      return matchSearch && matchType && matchStock
    })
  }, [products, search, filterType, filterStock])

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Gagal menghapus produk')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      const res = await api.patch(`/products/${id}/toggle-active`)
      const updated = res.data.data
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: updated.is_active } : p))
    } catch {
      alert('Gagal mengubah status produk')
    } finally {
      setToggling(null)
    }
  }

  const outOfStock = products.filter(p => p.current_stock === 0).length

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Produk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {products.length} produk total
            {outOfStock > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 8 }}>· {outOfStock} stok kosong</span>
            )}
          </p>
        </div>
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
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', gap: 12, alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        {/* Carbon type filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {CARBON_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
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

        {/* Stock filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['semua', 'Semua Stok'], ['kosong', 'Kosong'], ['tersedia', 'Tersedia']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStock(val)}
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

        {/* View mode toggle */}
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

      {/* Content: Table or Catalog */}
      {viewMode === 'list' ? (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Memuat produk...
            </div>
          ) : filtered.length === 0 ? (
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
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
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
                          onClick={() => handleDelete(p.id)}
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
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16,
        }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Memuat produk...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
              Tidak ada produk ditemukan
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
            }}>
              {filtered.map(p => (
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
        </div>
      )}

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>
          Menampilkan {filtered.length} dari {products.length} produk
        </div>
      )}

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(id) => navigate(`/products/${id}/edit`)}
      />
    </div>
  )
}
