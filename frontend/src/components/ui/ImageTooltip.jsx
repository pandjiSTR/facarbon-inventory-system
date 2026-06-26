import { useState, useRef, useCallback, useEffect } from 'react'

export default function ImageTooltip({ src, alt, children, onClick }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const showTimer = useRef(null)
  const hideTimer = useRef(null)
  const wrapperRef = useRef(null)

  const IMG_W = 180
  const TEXT_H = 32
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
    const h = src ? IMG_W + TEXT_H + 4 : 36
    let top = rect.top
    if (top + h > window.innerHeight - 8) {
      top = window.innerHeight - h - 8
    }
    setPos({ top, left })
    clearTimeout(hideTimer.current)
    showTimer.current = setTimeout(() => setShow(true), 250)
  }, [src])

  const handleLeave = useCallback(() => {
    clearTimeout(showTimer.current)
    // Grace period 200ms — kalau mouse masuk ke preview, hide di-cancel
    hideTimer.current = setTimeout(() => setShow(false), 200)
  }, [])

  const handlePreviewEnter = useCallback(() => {
    clearTimeout(hideTimer.current)
  }, [])

  const handlePreviewLeave = useCallback(() => {
    setShow(false)
  }, [])

  const handlePreviewClick = useCallback((e) => {
    e.stopPropagation()
    onClick?.()
    // rAF — modal overlay sudah ngerender duluan, nutup preview
    // baru setelah itu preview di-remove dari DOM (gak kelihatan ilangnya)
    requestAnimationFrame(() => setShow(false))
  }, [onClick])

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current)
      clearTimeout(hideTimer.current)
    }
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
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 40,
            cursor: 'pointer',
            animation: 'fadeIn 0.12s ease-out',
          }}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={handlePreviewLeave}
          onClick={handlePreviewClick}
        >
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
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            klik untuk detail produk
          </div>
        </div>
      )}

      {/* Text fallback — no image */}
      {show && !src && (
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
            animation: 'fadeIn 0.12s ease-out',
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
