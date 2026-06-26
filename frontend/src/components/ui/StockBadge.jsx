import { AlertCircle } from 'lucide-react'

export default function StockBadge({ stock }) {
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
