import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Loader2, ImageOff } from 'lucide-react'

export default function ImageModal({ src, alt, isOpen, onClose, productName }) {
  const overlayRef = useRef(null)
  const [imgState, setImgState] = useState('loading')
  const [closing, setClosing] = useState(false)
  const timerRef = useRef(null)

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    timerRef.current = setTimeout(() => {
      onClose?.()
      setClosing(false)
    }, 120)
  }, [closing, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setImgState('loading') // eslint-disable-line react-hooks/set-state-in-effect
      setClosing(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      clearTimeout(timerRef.current)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !closing) handleClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, closing, handleClose])

  if (!isOpen && !closing) return null
  if (!src && !closing) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: closing ? 'fadeOut 0.12s ease-in forwards' : 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{
        position: 'relative',
        maxWidth: 700, width: '80vw', maxHeight: '90vh',
        background: 'var(--bg-surface)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        animation: closing ? 'scaleOut 0.12s ease-in forwards' : 'scaleIn 0.2s ease-out',
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 1,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
        >
          <X size={18} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 200, maxHeight: 'calc(90vh - 48px)',
          overflow: 'hidden',
        }}>
          {imgState === 'loading' && (
            <div style={{ padding: 48, color: 'var(--text-muted)' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {imgState === 'error' && (
            <div style={{
              padding: 48, textAlign: 'center', color: 'var(--text-muted)',
            }}>
              <ImageOff size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Gagal memuat gambar</p>
            </div>
          )}

          {imgState !== 'error' && (
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: '100%', maxHeight: 'calc(90vh - 48px)',
                objectFit: 'contain',
                display: imgState === 'loaded' ? 'block' : 'none',
              }}
              onLoad={() => setImgState('loaded')}
              onError={() => setImgState('error')}
            />
          )}
        </div>

        {productName && (
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: 13, fontFamily: 'Inter, sans-serif',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            {productName}
          </div>
        )}
      </div>
    </div>
  )
}
