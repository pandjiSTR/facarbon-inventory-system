import { useState, useRef, useCallback, useEffect } from 'react'
import { Image, ImageOff, Loader2 } from 'lucide-react'
import ImageModal from './ImageModal'

export default function ImagePreview({ src, alt, productName }) {
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timerRef = useRef(null)

  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // ── No photo ──
  if (!src) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 6, verticalAlign: 'middle' }}>
        <ImageOff size={14} color="var(--text-muted)" style={{ opacity: 0.4 }} />
      </span>
    )
  }

  // ── Has photo ──
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsHovered(true)
      setImgLoaded(false)
      setImgError(false)
      calculatePosition()
    }, 300)
  }

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current)
    setIsHovered(false)
  }

  const calculatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipW = 200
    const gap = 10
    let left = rect.right + gap
    let top = rect.top - 100

    // If tooltip overflows right viewport, show on left
    if (left + tooltipW > window.innerWidth - 16) {
      left = rect.left - tooltipW - gap
    }

    // Clamp top so tooltip doesn't go off-screen
    if (top < 8) top = 8
    if (top + 200 > window.innerHeight - 8) {
      top = window.innerHeight - 200 - 8
    }

    setTooltipPos({ top, left })
  }

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    setIsModalOpen(true)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  // Recalculate position on scroll/resize while tooltip is visible
  useEffect(() => {
    if (!isHovered) return
    const handle = () => calculatePosition()
    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)
    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
    }
  }, [isHovered])

  return (
    <>
      {/* Trigger icon */}
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          display: 'inline-flex', alignItems: 'center', marginLeft: 6,
          verticalAlign: 'middle', cursor: 'pointer',
          flexShrink: 0,
          color: 'var(--accent)',
          opacity: 0.7, transition: 'opacity 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '1'}
        onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
      >
        <Image size={16} />
      </span>

      {/* Tooltip */}
      {isHovered && (
        <div
          ref={tooltipRef}
          onMouseEnter={() => {
            clearTimeout(timerRef.current)
            setIsHovered(true)
          }}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            zIndex: 55,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            maxWidth: 200,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Loading spinner */}
          {!imgLoaded && !imgError && (
            <div style={{
              width: 200, height: 160,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {/* Error state */}
          {imgError && (
            <div style={{
              width: 200, height: 160,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', gap: 6,
            }}>
              <ImageOff size={24} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }}>Gagal load</span>
            </div>
          )}

          {/* Image */}
          <img
            src={src}
            alt={alt}
            style={{
              width: 200,
              height: 'auto',
              display: imgLoaded && !imgError ? 'block' : 'none',
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            draggable={false}
          />

          {/* Product name label */}
          {productName && imgLoaded && !imgError && (
            <div style={{
              padding: '6px 8px',
              fontSize: 11, fontFamily: 'Inter, sans-serif',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {productName}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <ImageModal
        src={src}
        alt={alt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
      />
    </>
  )
}
