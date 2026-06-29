import { useCallback, useTransition } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import logoDark from '../../assets/logo-facarbon-dark.webp'
import logoWhite from '../../assets/logo-facarbon-white.webp'
import { prefetchRoute } from '../../api/prefetch'
import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine,
  DollarSign, FileText, History, BarChart3, Upload, LogOut,
  AlertTriangle, Sun, Moon, Users,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/products',     label: 'Produk',       icon: Package },
  { to: '/stock-in',     label: 'Stok Masuk',   icon: ArrowDownToLine },
  { to: '/stock-out',    label: 'Stok Keluar',  icon: ArrowUpFromLine },
  { to: '/finances',     label: 'Keuangan',     icon: DollarSign },
  { to: '/invoices',     label: 'Faktur',       icon: FileText },
  { to: '/transactions', label: 'Riwayat',      icon: History },
  { to: '/reports',      label: 'Laporan',      icon: BarChart3 },
  { to: '/import',       label: 'Import',       icon: Upload },
  { to: '/users',        label: 'Pengguna',     icon: Users },
]

export default function Sidebar({ lowStockCount = 0 }) {
  const { user, logout } = useAuth()
  const { theme, toggle, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const handleNavEnter = useCallback((route) => {
    prefetchRoute(queryClient, route)
  }, [queryClient])

  const handleNavClick = useCallback((to) => {
    startTransition(() => {
      navigate(to)
    })
  }, [navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50,
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px', borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}>
          <img
            src={isDark ? logoWhite : logoDark}
            alt="Facarbon"
            style={{ height: 84, width: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActive(to)
          return (
            <div
              key={to}
              onClick={() => handleNavClick(to)}
              onMouseEnter={() => handleNavEnter(to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 18px', margin: '1px 0', cursor: 'pointer',
                textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-bg)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                fontWeight: active ? 500 : 400,
                opacity: isPending && active ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {to === '/products' && lowStockCount > 0 && (
                <span style={{
                  background: 'var(--red)', color: '#fff',
                  fontSize: 10, fontWeight: 600, padding: '1px 6px',
                  borderRadius: 99, fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {lowStockCount}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <div style={{
          margin: '0 12px 8px', padding: '8px 10px',
          background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.2)',
          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <AlertTriangle size={13} color="var(--red)" />
          <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
            {lowStockCount} produk stok tipis
          </span>
        </div>
      )}

      {/* Theme toggle */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={toggle}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif',
            fontSize: 12, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {theme === 'dark'
            ? <><Sun size={13} /> <span>Light Mode</span></>
            : <><Moon size={13} /> <span>Dark Mode</span></>
          }
        </button>
      </div>

      {/* User + logout */}
      <div style={{
        padding: '12px 14px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: 'var(--text-primary)', fontSize: 12, fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.name || 'User'}
          </div>
          <div style={{
            color: 'var(--text-muted)', fontSize: 10,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user?.email || ''}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 4,
            display: 'flex', alignItems: 'center', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}