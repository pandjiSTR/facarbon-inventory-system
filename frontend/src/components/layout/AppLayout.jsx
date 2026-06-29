import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import api from '../../api/axios'
import { prefetchDashboard, prefetchProducts } from '../../api/prefetch'

export default function AppLayout() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [lowStockCount, setLowStockCount] = useState(0)

  // Prefetch critical data immediately after login
  useEffect(() => {
    prefetchDashboard(queryClient)
    prefetchProducts(queryClient, 1)
  }, [queryClient])

  useEffect(() => {
    // Fetch low stock count from dashboard endpoint
    api.get('/dashboard')
      .then(res => {
        const data = res.data?.data || res.data
        const alerts = data?.alerts?.out_of_stock_products
        const count = Array.isArray(alerts) ? alerts.length : 0
        setLowStockCount(count)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar lowStockCount={lowStockCount} />
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
