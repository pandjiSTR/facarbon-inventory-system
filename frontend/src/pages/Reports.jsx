import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Package } from 'lucide-react'
import api from '../api/axios'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

const CARBON_LABELS = { twill: 'Twill', forged: 'Forged', plain: 'Plain' }
const CARBON_COLORS = { twill: '#a0c4ff', forged: '#c8a96e', plain: '#b0b0b0' }

const today = () => new Date().toISOString().split('T')[0]
const monthAgo = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().split('T')[0]
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-active)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'Inter, sans-serif', fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color || p.fill, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [products, setProducts] = useState([])
  const [stockIns, setStockIns] = useState([])
  const [stockOuts, setStockOuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(monthAgo())
  const [dateTo, setDateTo] = useState(today())

  useEffect(() => {
    Promise.all([
      api.get('/products').catch(() => ({ data: { data: [] } })),
      api.get('/stock-in').catch(() => ({ data: { data: [] } })),
      api.get('/stock-out').catch(() => ({ data: { data: [] } })),
    ]).then(([p, si, so]) => {
      setProducts(p.data.data || [])
      setStockIns(si.data.data || [])
      setStockOuts(so.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  // Filter stock movements by date range
  const filteredIns = useMemo(() =>
    stockIns.filter(r => r.date >= dateFrom && r.date <= dateTo), [stockIns, dateFrom, dateTo])
  const filteredOuts = useMemo(() =>
    stockOuts.filter(r => r.date >= dateFrom && r.date <= dateTo), [stockOuts, dateFrom, dateTo])

  // Summary stats
  const summary = useMemo(() => {
    const totalIn = filteredIns.reduce((s, r) => s + r.quantity, 0)
    const totalOut = filteredOuts.reduce((s, r) => s + r.quantity, 0)
    const totalModalIn = filteredIns.reduce((s, r) => s + r.quantity * r.modal_price, 0)
    const totalRevenueOut = filteredOuts.reduce((s, r) => s + r.quantity * r.sell_price, 0)
    return { totalIn, totalOut, totalModalIn, totalRevenueOut }
  }, [filteredIns, filteredOuts])

  // Bar chart: stok per carbon type (current stock distribution)
  const carbonDistribution = useMemo(() => {
    const map = {}
    products.forEach(p => {
      const type = p.carbon_type
      if (!map[type]) map[type] = { type: CARBON_LABELS[type] || type, stok: 0, produk: 0 }
      map[type].stok += p.current_stock
      map[type].produk += 1
    })
    return Object.values(map)
  }, [products])

  // Pie chart: stok keluar per channel
  const channelDistribution = useMemo(() => {
    const map = {}
    filteredOuts.forEach(r => {
      map[r.channel] = (map[r.channel] || 0) + r.quantity
    })
    const labels = { reseller: 'Reseller', online: 'Online', langsung: 'Langsung' }
    const colors = { reseller: '#c8a96e', online: '#a0c4ff', langsung: '#5a9e5a' }
    return Object.entries(map).map(([k, v]) => ({ name: labels[k] || k, value: v, color: colors[k] }))
  }, [filteredOuts])

  // Table: per-product report dalam rentang tanggal
  const productReport = useMemo(() => {
    return products.map(p => {
      const inQty = filteredIns.filter(r => r.product_id === p.id).reduce((s, r) => s + r.quantity, 0)
      const outQty = filteredOuts.filter(r => r.product_id === p.id).reduce((s, r) => s + r.quantity, 0)
      return { ...p, in_qty: inQty, out_qty: outQty }
    }).filter(p => p.in_qty > 0 || p.out_qty > 0 || p.current_stock > 0)
      .sort((a, b) => b.out_qty - a.out_qty)
  }, [products, filteredIns, filteredOuts])

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Laporan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Laporan stok & pergerakan barang
          </p>
        </div>

        {/* Date range filter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px',
        }}>
          <Calendar size={13} color="var(--text-muted)" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 12, fontFamily: 'JetBrains Mono, monospace', colorScheme: 'dark', outline: 'none',
            }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 12, fontFamily: 'JetBrains Mono, monospace', colorScheme: 'dark', outline: 'none',
            }} />
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Stok Masuk', value: summary.totalIn, icon: TrendingUp, color: 'var(--green)', bg: 'var(--green-bg)' },
          { label: 'Stok Keluar', value: summary.totalOut, icon: TrendingDown, color: 'var(--red)', bg: 'var(--red-bg)' },
          { label: 'Nilai Modal Masuk', value: fmt(summary.totalModalIn), icon: Package, color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)' },
          { label: 'Pendapatan Keluar', value: fmt(summary.totalRevenueOut), icon: Package, color: 'var(--accent)', bg: 'var(--accent-bg)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Stok per carbon type */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px 12px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Stok Saat Ini per Carbon Type
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>total stok semua produk aktif</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={carbonDistribution} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: '#888', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stok" name="Total Stok" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel distribution pie */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px 12px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Stok Keluar per Channel
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>periode terpilih</div>
          </div>
          {channelDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={channelDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {channelDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Inter' }} iconType="circle" iconSize={7} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              Tidak ada stok keluar di periode ini
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Laporan Stok per Produk
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {fmtDate(dateFrom)} — {fmtDate(dateTo)}
          </p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            Memuat laporan...
          </div>
        ) : productReport.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            Tidak ada pergerakan stok di periode ini
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                {['SKU', 'Produk', 'Carbon Type', 'Stok Masuk', 'Stok Keluar', 'Stok Saat Ini'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productReport.map((p, i) => (
                <tr key={p.id}
                  style={{ borderBottom: i < productReport.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{p.sku}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      color: CARBON_COLORS[p.carbon_type] || 'var(--text-secondary)',
                      background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4,
                    }}>
                      {CARBON_LABELS[p.carbon_type] || p.carbon_type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                      {p.in_qty > 0 ? `+${p.in_qty}` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
                      {p.out_qty > 0 ? `-${p.out_qty}` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                      color: p.current_stock === 0 ? 'var(--red)' : 'var(--text-primary)',
                    }}>
                      {p.current_stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
