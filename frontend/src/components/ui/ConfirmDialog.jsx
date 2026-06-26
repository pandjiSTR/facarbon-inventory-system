import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null

  const accentColor = variant === 'danger' ? 'var(--red)' : 'var(--accent)'
  const btnBg = variant === 'danger' ? 'var(--red)' : 'var(--accent)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-surface)', borderRadius: 12,
          padding: 24, width: 380, maxWidth: '90vw',
          border: '1px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: variant === 'danger' ? 'var(--red-bg)' : 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <AlertTriangle size={18} color={accentColor} />
        </div>

        <h3 style={{
          fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
          color: 'var(--text-primary)', marginBottom: 6,
        }}>
          {title}
        </h3>

        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 13,
          color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20,
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'transparent', cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontSize: 13,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: loading ? 'color-mix(in srgb, ' + btnBg + ', transparent 40%)' : btnBg,
              cursor: loading ? 'not-allowed' : 'pointer',
              color: variant === 'danger' ? '#fff' : '#0d0d0d',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading && (
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                animation: 'spin 0.6s linear infinite',
                display: 'inline-block',
              }} />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
