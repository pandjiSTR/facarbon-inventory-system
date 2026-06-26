import { useEffect, useState, useCallback } from 'react'
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
  const [closing, setClosing] = useState(false)

  const animatedClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      onClose()
      setClosing(false)
    }, 120)
  }, [closing, onClose])

  // Lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setClosing(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !closing) animatedClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, closing, animatedClose])

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

  if (!isOpen && !closing) return null
  if (!product) return null

  const p = product

  return (
    <>
      {/* Overlay */}
      <div
        onClick={animatedClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.6)',
          animation: closing ? 'fadeOut 0.12s ease-in forwards' : 'fadeIn 0.15s ease-out',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 51,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          maxWidth: 740, width: '100%',
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          animation: closing ? 'scaleOut 0.12s ease-in forwards' : 'scaleIn 0.2s ease-out',
        }}>
          {/* ── Header ── */}
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
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => { onClose(); onEdit(p.id) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--accent)', border: 'none', borderRadius: 6,
                  padding: '6px 12px', cursor: 'pointer',
                  color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
                  fontSize: 12, fontWeight: 600,
                }}
              >
                <ExternalLink size={13} />
                Edit
              </button>
              <button
                onClick={animatedClose}
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
          </div>

          {/* ── Body ── */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '20px',
          }}>
            {/* 2-Column layout: Photo (left) + Info (right) */}
            <div style={{
              display: 'flex', gap: 24,
              flexDirection: window.innerWidth < 600 ? 'column' : 'row',
            }}>
              {/* Left: Photo */}
              <div style={{ width: 260, flexShrink: 0, alignSelf: 'flex-start' }}>
                <div
                  onClick={() => p.photo_url && setImgModalOpen(true)}
                  style={{
                    width: '100%', aspectRatio: '1/1',
                    background: 'var(--bg-elevated)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: p.photo_url ? 'pointer' : 'default',
                    overflow: 'hidden',
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
              </div>

              {/* Right: Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* SKU */}
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  color: 'var(--text-secondary)', margin: 0, marginBottom: 2,
                }}>
                  {p.sku}
                </p>

                {/* Name */}
                <h1 style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 700,
                  color: 'var(--text-primary)', margin: 0, marginBottom: 10,
                  lineHeight: 1.3,
                }}>
                  {p.name}
                </h1>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
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

                {/* Harga */}
                <Section title="Harga">
                  <PriceRow label="Modal" value={p.modal_price} color="var(--text-secondary)" />
                  <PriceRow label="Reseller" value={p.reseller_price} color="var(--accent)" bold />
                  <PriceRow label="Online" value={p.online_price} color="var(--text-secondary)" />
                </Section>
              </div>
            </div>

            <Divider />

            {/* ── Riwayat Stok ── */}
            <Section title="Riwayat Stok">
              {historyLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, margin: 0 }}>Memuat riwayat...</p>
                </div>
              ) : historyError ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, margin: 0 }}>Gagal memuat riwayat stok.</p>
                </div>
              ) : stockHistory ? (
                <>
                  {/* Summary */}
                  <div style={{
                    display: 'flex', gap: 16, marginBottom: 12,
                    fontFamily: 'Inter, sans-serif', fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                      Masuk: {stockHistory.total_in}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>
                      Keluar: {stockHistory.total_out}
                    </span>
                  </div>

                  {/* Timeline entries */}
                  {stockHistory.stock_in?.length > 0 && stockHistory.stock_in.slice(0, 8).map(item => (
                    <HistoryRow
                      key={'in-' + item.id}
                      date={item.date}
                      qty={'+' + item.quantity}
                      qtyColor="var(--green)"
                      value={item.modal_price * item.quantity}
                      label={item.category === 'produksi' ? 'Produksi' : 'Pembelian'}
                      user={item.user?.name}
                    />
                  ))}
                  {stockHistory.stock_out?.length > 0 && stockHistory.stock_out.slice(0, 8).map(item => (
                    <HistoryRow
                      key={'out-' + item.id}
                      date={item.date}
                      qty={'-' + item.quantity}
                      qtyColor="var(--red)"
                      value={item.sell_price * item.quantity}
                      label={item.channel}
                      user={item.user?.name}
                    />
                  ))}

                  {(!stockHistory.stock_in?.length && !stockHistory.stock_out?.length) && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--text-muted)', margin: '12px 0', textAlign: 'center' }}>
                      Belum ada transaksi stok.
                    </p>
                  )}
                </>
              ) : null}
            </Section>
          </div>
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

function HistoryRow({ date, qty, qtyColor, value, label, user }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: '1px solid var(--border)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)', fontSize: 11, minWidth: 75 }}>
          {fmtDate(date)}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: qtyColor, minWidth: 30 }}>
          {qty}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
          {fmt(value)}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'var(--text-muted)', minWidth: 40, textAlign: 'right' }}>
          {user || '—'}
        </span>
      </div>
    </div>
  )
}
