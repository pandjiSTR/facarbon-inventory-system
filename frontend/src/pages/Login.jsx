import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import logoDark from '../assets/logo-facarbon-dark.png'
import logoWhite from '../assets/logo-facarbon-white.png'

export default function Login() {
  const { login, loading } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 28px', borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            marginBottom: 16,
          }}>
            <img
              src={isDark ? logoWhite : logoDark}
              alt="Facarbon"
              style={{ height: 120, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <h1 className="font-ui" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18, letterSpacing: '0.05em', marginBottom: 4 }}>
            FACARBON
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
            INVENTORY SYSTEM
          </p>
          </div>
        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 28,
        }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginBottom: 20 }}>
            Masuk ke sistem
          </h2>

          {error && (
            <div style={{
              background: 'var(--red-bg)',
              border: '1px solid rgba(224,90,90,0.25)',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 13,
              color: 'var(--red)',
              fontFamily: 'Inter, sans-serif',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                placeholder="admin@facarbon.com"
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                color: '#0d0d0d',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
