import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: 24,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--red-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{ fontSize: 20, color: 'var(--red)' }}>!</span>
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 8,
            }}>
              Terjadi Kesalahan
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5,
            }}>
              {this.props.fallbackMessage || 'Terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--accent)', border: 'none', borderRadius: 8,
                padding: '9px 20px', cursor: 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
                fontSize: 13, fontWeight: 600,
              }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
