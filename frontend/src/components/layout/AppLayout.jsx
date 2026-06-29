import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import { prefetchDashboard, prefetchProducts } from '../../api/prefetch'

export default function AppLayout() {
  const location = useLocation()
  const queryClient = useQueryClient()

  // Prefetch critical data immediately after login
  useEffect(() => {
    prefetchDashboard(queryClient)
    prefetchProducts(queryClient, 1)
  }, [queryClient])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          minHeight: '100vh',
          padding: '28px 32px',
          overflowX: 'hidden',
        }}
      >
        <div key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
