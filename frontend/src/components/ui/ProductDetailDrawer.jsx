import { useEffect, useState } from 'react'
import { X, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import api from '../../api/axios'
import ImageModal from './ImageModal'

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '—'

const fmtDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

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
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
      color: 'var(--red)', background: 'var(--red-bg)',
      padding: '2px 8px', borderRadius: 4,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <AlertCircle size={9} /> KOSONG
    </span>
  )
  if (stock <= 2) return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
      color: '#e0a85a', background: 'rgba(224,168,90,0.08)',
      padding: '2px 8px', borderRadius: 4,
    }}>
      {stock}
    </span>
  )
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
      color: 'var(--green)', background: 'var(--green-bg)',
      padding: '2px 8px', borderRadius: 4,
    }}>
      {stock}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{
        fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600,
        color: 'var(--text-muted)', margin: 0, marginBottom: 6,
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {title}
      </h4>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
}

export default function ProductDetailDrawer({ product, isOpen, onClose, onEdit }) {
  const [stockHistory, setStockHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState(false)
  const [imgModalOpen, setImgModalOpen] = useState(false)

  // Lock body scroll when drawer opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Fetch stock history
  useEffect(() => {
    if (!isOpen || !product) {
      setStockHistory(null)
      setHistoryError(false)
      return
    }
    setHistoryLoading(true)
    setHistoryError(false)
    api.get(`/products/${product.id}/stock-history`)
      .then(res => setStockHistory(res.data.data))
      .catch(() => setHistoryError(true))
      .finally(() => setHistoryLoading(false))
  }, [isOpen, product?.id])

  if (!isOpen || !product) return null

  const p = product

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 51,
        width: 420, maxWidth: '100vw',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease-out',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Detail Produk
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px',
        }}>
          {/* Photo */}
          <div
            onClick={() => p.photo_url && setImgModalOpen(true)}
            style={{
              width: '100%', aspectRatio: '16/9',
              background: 'var(--bg-elevated)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: p.photo_url ? 'pointer' : 'default',
              overflow: 'hidden',
              marginBottom: 16,
              border: '1px solid var(--border)',
            }}
          >
            {p.photo_url ? (
              <img
                src={p.photo_url}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 4 }}>🛵</div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>No Photo</p>
              </div>
            )}
          </div>

          {/* SKU + Name */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'var(--text-secondary)', margin: 0, marginBottom: 2,
          }}>
            {p.sku}
          </p>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700,
            color: 'var(--text-primary)', margin: 0, marginBottom: 10,
            lineHeight: 1.3,
          }}>
            {p.name}
          </h1>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <Badge type={p.carbon_type} />
            <StockBadge stock={p.current_stock} />
            <span style={{
              fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
              color: p.is_active ? 'var(--green)' : 'var(--text-muted)',
              background: p.is_active ? 'var(--green-bg)' : 'var(--bg-elevated)',
              padding: '2px 8px', borderRadius: 4,
            }}>
              {p.is_active ? '● Aktif' : '● Nonaktif'}
            </span>
          </div>

          <Divider />

          {/* Kompatibilitas */}
          <Section title="Kompatibilitas">
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              color: 'var(--text-secondary)', margin: 0,
              lineHeight: 1.5,
            }}>
              {Array.isArray(p.vespa_compatibility) ? p.vespa_compatibility.join(', ') : p.vespa_compatibility || '—'}
            </p>
          </Section>

          <Divider />

          {/* Harga */}
          <Section title="Harga">
            <PriceRow label="Modal" value={p.modal_price} color="var(--text-secondary)" />
            <PriceRow label="Reseller" value={p.reseller_price} color="var(--accent)" bold />
            <PriceRow label="Online" value={p.online_price} color="var(--text-secondary)" />
          </Section>

          <Divider />

          {/* Riwayat Stok */}
          <Section title="Riwayat Stok">
            {historyLoading ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, margin: 0 }}>Memuat riwayat...</p>
              </div>
            ) : historyError ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, margin: 0 }}>Gagal memuat riwayat stok.</p>
              </div>
            ) : stockHistory ? (
              <>
                {/* Barang Masuk */}
                {stockHistory.stock_in?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      color: 'var(--green)', margin: '0 0 6px',
                    }}>
                      Barang Masuk ({stockHistory.total_in})
                    </p>
                    {stockHistory.stock_in.slice(0, 10).map(item => (
                      <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: '1px solid var(--border)',
                        fontSize: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', fontSize: 11 }}>
                            {fmtDate(item.date)}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--green)' }}>
                            +{item.quantity}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                            {fmt(item.modal_price * item.quantity)}
                          </span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'var(--text-muted)' }}>
                            {item.user?.name || '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Barang Keluar */}
                {stockHistory.stock_out?.length > 0 && (
                  <div>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      color: 'var(--red)', margin: '0 0 6px',
                    }}>
                      Barang Keluar ({stockHistory.total_out})
                    </p>
                    {stockHistory.stock_out.slice(0, 10).map(item => (
                      <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: '1px solid var(--border)',
                        fontSize: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', fontSize: 11 }}>
                            {fmtDate(item.date)}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--red)' }}>
                            -{item.quantity}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                            {fmt(item.sell_price * item.quantity)}
                          </span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'var(--text-muted)' }}>
                            {item.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Kosong */}
                {(!stockHistory.stock_in?.length && !stockHistory.stock_out?.length) && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--text-muted)', margin: '12px 0', textAlign: 'center' }}>
                    Belum ada transaksi stok.
                  </p>
                )}
              </>
            ) : null}
          </Section>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => { onClose(); onEdit(p.id) }}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'var(--accent)', border: 'none', borderRadius: 8,
              padding: '10px 16px', cursor: 'pointer',
              color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <ExternalLink size={14} />
            Edit Produk
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {p.photo_url && (
        <ImageModal
          src={p.photo_url}
          alt={p.name}
          isOpen={imgModalOpen}
          onClose={() => setImgModalOpen(false)}
          productName={p.name}
        />
      )}

      {/* Inject keyframes only once */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

function PriceRow({ label, value, color, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '4px 0',
    }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
        fontWeight: bold ? 600 : 500,
        color: value != null ? color : 'var(--text-muted)',
      }}>
        {fmt(value)}
      </span>
    </div>
  )
}
