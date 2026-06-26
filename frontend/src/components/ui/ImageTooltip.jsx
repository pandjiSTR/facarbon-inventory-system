import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageTooltip({ src, alt, children, onClick }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const showTimer = useRef(null)
  const hideTimer = useRef(null)
  const cleanupTimer = useRef(null)
  const wrapperRef = useRef(null)

  const IMG_W = 180
  const TEXT_H = 32
  const GAP = 8

  const hide = useCallback(() => {
    clearTimeout(showTimer.current)
    clearTimeout(hideTimer.current)
    setVisible(false)
    cleanupTimer.current = setTimeout(() => setMounted(false), 150)
  }, [])

  const show = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const w = src ? IMG_W : 130
    let left = rect.right + GAP
    if (left + w > window.innerWidth - 8) {
      left = window.innerWidth - w - 8
    }
    const h = src ? IMG_W + TEXT_H + 4 : 36
    let top = rect.top
    if (top + h > window.innerHeight - 8) {
      top = window.innerHeight - h - 8
    }
    setPos({ top, left })
    clearTimeout(cleanupTimer.current)
    setMounted(true)
    requestAnimationFrame(() => setVisible(true))
  }, [src])

  const handleEnter = useCallback(() => {
    clearTimeout(hideTimer.current)
    clearTimeout(cleanupTimer.current)
    showTimer.current = setTimeout(() => show(), 250)
  }, [show])

  const handleLeave = useCallback(() => {
    clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => hide(), 200)
  }, [hide])

  const handlePreviewEnter = useCallback(() => {
    clearTimeout(hideTimer.current)
  }, [])

  const handlePreviewLeave = useCallback(() => {
    hide()
  }, [hide])

  const handlePreviewClick = useCallback((e) => {
    e.stopPropagation()
    onClick?.()
    hide()
  }, [onClick, hide])

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current)
      clearTimeout(hideTimer.current)
      clearTimeout(cleanupTimer.current)
    }
  }, [])

  const popStyle = {
    transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-3px)',
    pointerEvents: visible ? 'auto' : 'none',
  }

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: 'relative', display: 'inline' }}
    >
      {children}

      {/* Image preview */}
      {mounted && src && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 40,
            cursor: 'pointer',
            ...popStyle,
          }}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          onClick={handlePreviewClick}
        >
          <div style={{
            width: IMG_W,
            height: IMG_W,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            background: 'var(--bg-elevated)',
          }}>
            <img
              src={src}
              alt={alt || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{
            marginTop: 4,
            padding: '5px 0',
            borderRadius: 6,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            klik untuk detail produk
          </div>
        </div>
      )}

      {/* Text fallback — no image */}
      {mounted && !src && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 40,
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            ...popStyle,
          }}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          onClick={handlePreviewClick}
        >
          Tidak ada gambar
        </div>
      )}
    </span>
  )
}
