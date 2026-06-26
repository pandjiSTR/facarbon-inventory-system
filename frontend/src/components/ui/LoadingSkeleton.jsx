export function CardSkeleton({ count = 4, height = 90 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)`, gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, height,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 16,
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} style={{
            height: 12, borderRadius: 4,
            background: 'var(--bg-elevated)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          padding: '12px 14px',
          borderBottom: r < rows - 1 ? '1px solid var(--border)' : 'none',
          display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 16,
        }}>
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} style={{
              height: 10, borderRadius: 4,
              background: 'var(--bg-elevated)',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${(r * columns + c) * 0.05}s`,
            }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 220 }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12, height,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}
