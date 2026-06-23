import { CheckCircle2, AlertTriangle } from 'lucide-react'

export function ResultBanner({ result, onReset }) {
  if (!result) return null
  return (
    <div style={{
      background: 'var(--green-bg)', border: '1px solid rgba(90,158,90,0.25)',
      borderRadius: 12, padding: '16px 20px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <CheckCircle2 size={20} color="var(--green)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
          {result.message}
        </div>
        {result.data?.errors?.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {result.data.errors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                Baris {e.row_number ?? e.index}: {e.item_name ? `${e.item_name} — ` : ''}{e.reason}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onReset} style={{
        background: 'var(--accent)', border: 'none', borderRadius: 6,
        padding: '6px 14px', cursor: 'pointer', color: '#0d0d0d',
        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>
        Import Lagi
      </button>
    </div>
  )
}

export function ErrorBanner({ error }) {
  if (!error) return null
  return (
    <div style={{
      background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)',
      borderRadius: 8, padding: '12px 16px', marginBottom: 20,
      fontSize: 13, color: 'var(--red)', fontFamily: 'Inter, sans-serif',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <AlertTriangle size={15} style={{ flexShrink: 0 }} />
      {error}
    </div>
  )
}
