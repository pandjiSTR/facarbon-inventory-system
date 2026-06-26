import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageTooltip({ src, alt, children }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const timer = useRef(null)
  const wrapperRef = useRef(null)

  const IMG_W = 180
  const TEXT_W = 32
  const GAP = 8

  const handleEnter = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const w = src ? IMG_W : 130
    let left = rect.right + GAP
    if (left + w > window.innerWidth - 8) {
      left = window.innerWidth - w - 8
    }
    const h = src ? IMG_W + TEXT_W + 4 : 36
    let top = rect.top
    if (top + h > window.innerHeight - 8) {
      top = window.innerHeight - h - 8
    }
    setPos({ top, left })
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

      {/* Image preview */}
      {show && src && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          zIndex: 999,
          animation: 'fadeIn 0.12s ease-out',
        }}>
          {/* Gambar */}
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
          {/* Label */}
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
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}>
            klik untuk detail produk
          </div>
        </div>
      )}

      {/* Text fallback — no image */}
      {show && !src && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          zIndex: 999,
          padding: '8px 12px',
          borderRadius: 6,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.12s ease-out',
        }}>
          Tidak ada gambar
        </div>
      )}
    </span>
  )
}
