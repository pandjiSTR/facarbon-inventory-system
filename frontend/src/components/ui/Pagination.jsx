import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page } = meta
  const pages = []

  const start = Math.max(1, current_page - 2)
  const end = Math.min(last_page, current_page + 2)

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < last_page) {
    if (end < last_page - 1) pages.push('...')
    pages.push(last_page)
  }

  const btn = (active, disabled, label, onClick) => (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        minWidth: 32, height: 32, borderRadius: 6,
        border: active ? 'none' : '1px solid var(--border)',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#0d0d0d' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 8px', opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 4, padding: '12px 0',
    }}>
      {btn(false, current_page === 1, <ChevronLeft size={14} />, () => onPageChange(current_page - 1))}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', fontSize: 12, padding: '0 4px' }}>...</span>
        ) : (
          btn(p === current_page, false, p, () => onPageChange(p))
        )
      )}
      {btn(false, current_page === last_page, <ChevronRight size={14} />, () => onPageChange(current_page + 1))}
    </div>
  )
}
