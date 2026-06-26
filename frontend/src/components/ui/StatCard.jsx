export default function StatCard({ icon: Icon, label, value, sub, accent, iconBg }) {
  return (
    <div className="card-hover" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: iconBg || 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={accent || 'var(--accent)'} strokeWidth={1.8} />
        </div>
        {sub && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22,
          fontWeight: 600,
          color: accent || 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </div>
      </div>
    </div>
  )
}
