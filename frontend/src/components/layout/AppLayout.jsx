import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import api from '../../api/axios'

export default function AppLayout() {
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    // Fetch low stock count for badge
    api.get('/products?low_stock=1')
      .then(res => {
        const data = res.data?.data || res.data || []
        const count = Array.isArray(data)
          ? data.filter(p => p.stock <= p.min_stock).length
          : 0
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
        <Outlet />
      </main>
    </div>
  )
}
