import { useState } from 'react'
import { Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import ImageModal from './ImageModal'

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
    : '—'

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

export default function ProductCard({ product, onEdit, onDelete, onToggle, toggling, deleting }) {
  const [modalOpen, setModalOpen] = useState(false)
  const p = product

  return (
    <>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        opacity: p.is_active ? 1 : 0.5,
        transition: 'opacity 0.2s',
      }}>
        {/* Image area */}
        <div
          onClick={() => p.photo_url && setModalOpen(true)}
          style={{
            aspectRatio: '1/1',
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: p.photo_url ? 'pointer' : 'default',
            overflow: 'hidden',
            position: 'relative',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {p.photo_url ? (
            <img
              src={p.photo_url}
              alt={p.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { if (p.photo_url) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { if (p.photo_url) e.currentTarget.style.transform = 'scale(1)' }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 4 }}>
                🛵
              </div>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 11,
                color: 'var(--text-muted)', margin: 0,
              }}>
                No Photo
              </p>
            </div>
          )}
        </div>

        {/* Info area */}
        <div style={{ padding: '12px 14px 14px' }}>
          {/* Name */}
          <h3 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
            color: 'var(--text-primary)', margin: 0,
            marginBottom: 2, lineHeight: 1.3,
          }}>
            {p.name}
          </h3>

          {/* SKU */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: 'var(--text-secondary)', margin: 0,
            marginBottom: 8,
          }}>
            {p.sku}
          </p>

          {/* Badge row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <Badge type={p.carbon_type} />
            <StockBadge stock={p.current_stock} />
          </div>

          {/* Price */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
            color: 'var(--accent)', margin: 0,
            marginBottom: 12,
          }}>
            {fmt(p.reseller_price)}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onEdit(p.id)}
              title="Edit"
              style={{
                flex: 1,
                background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)',
                borderRadius: 6, padding: '6px 0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                color: 'var(--accent)', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500,
              }}
            >
              <Edit2 size={11} />
              Edit
            </button>
            <button
              onClick={() => onToggle(p.id)}
              disabled={toggling === p.id}
              title={p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                color: p.is_active ? 'var(--green)' : 'var(--text-muted)',
              }}
            >
              {p.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            </button>
            <button
              onClick={() => onDelete(p.id)}
              disabled={deleting === p.id}
              title="Hapus"
              style={{
                background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)',
                borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--red)',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {p.photo_url && (
        <ImageModal
          src={p.photo_url}
          alt={p.name}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          productName={p.name}
        />
      )}
    </>
  )
}
