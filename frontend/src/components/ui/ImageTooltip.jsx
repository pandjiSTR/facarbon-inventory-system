import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageTooltip({ src, alt, children }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const timer = useRef(null)
  const wrapperRef = useRef(null)

  const handleEnter = useCallback(() => {
    if (!src) return
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const tooltipW = 180
    let left = rect.left
    if (left + tooltipW > window.innerWidth - 8) {
      left = window.innerWidth - tooltipW - 8
    }
    setPos({ top: rect.bottom + 6, left })
    timer.current = setTimeout(() => setShow(true), 250)
  }, [src])

  const handleLeave = useCallback(() => {
    clearTimeout(timer.current)
    setShow(false)
  }, [])

  useEffect(() => {
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: 'relative', display: 'inline' }}
    >
      {children}
      {show && src && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          zIndex: 999,
          width: 180,
          height: 180,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          background: 'var(--bg-elevated)',
          pointerEvents: 'none',
          animation: 'fadeIn 0.12s ease-out',
        }}>
          <img
            src={src}
            alt={alt || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </span>
  )
}
