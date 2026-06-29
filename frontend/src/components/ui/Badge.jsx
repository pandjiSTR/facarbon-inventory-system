import { memo } from 'react'

const CARBON_LABELS = { twill: 'Twill', forged: 'Forged' }

const Badge = memo(function Badge({ type }) {
  const styles = {
    twill:  { color: '#a0c4ff', bg: 'rgba(160,196,255,0.08)' },
    forged: { color: 'var(--accent)', bg: 'var(--accent-bg)' },
  }
  const s = styles[type] || styles.forged
  return (
    <span style={{
      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
      color: s.color, background: s.bg,
      padding: '2px 8px', borderRadius: 4,
    }}>
      {CARBON_LABELS[type] || type}
    </span>
  )
})

export default Badge
