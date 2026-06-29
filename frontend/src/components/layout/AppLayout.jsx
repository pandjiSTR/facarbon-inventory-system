import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import api from '../../api/axios'

export default function AppLayout() {
  const location = useLocation()
  const [lowStockCount, setLowStockCount] = useState(0)

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
        <div key={location.pathname} style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
