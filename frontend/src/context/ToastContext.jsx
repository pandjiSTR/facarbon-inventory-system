import { createContext, useState, useCallback, useRef } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

export const ToastContext = createContext(null) // eslint-disable-line react-refresh/only-export-components

const ICONS = {
  success: { icon: Check, color: 'var(--green)', bg: 'var(--green-bg)' },
  error: { icon: X, color: 'var(--red)', bg: 'var(--red-bg)' },
  warning: { icon: AlertTriangle, color: '#e0a85a', bg: 'rgba(224,168,90,0.08)' },
  info: { icon: Info, color: 'var(--accent)', bg: 'var(--accent-bg)' },
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
  }, [])

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    timersRef.current[id] = setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360,
      }}>
        {toasts.map(t => {
          const cfg = ICONS[t.type] || ICONS.info
          const Icon = cfg.icon
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-surface)', border: `1px solid ${cfg.color}33`,
              borderRadius: 10, padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.2s ease-out',
              minWidth: 280,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: cfg.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={13} color={cfg.color} />
              </div>
              <span style={{
                flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif',
                color: 'var(--text-primary)', lineHeight: 1.4,
              }}>
                {t.message}
              </span>
              <button onClick={() => removeToast(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 2, display: 'flex',
              }}>
                <X size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
