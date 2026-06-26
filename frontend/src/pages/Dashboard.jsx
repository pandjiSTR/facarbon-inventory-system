import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Package, TrendingUp, TrendingDown, AlertTriangle,
  FileText, DollarSign, ShoppingCart, BarChart3
} from 'lucide-react'
import api from '../api/axios'

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']

// Dummy monthly data — will be replaced when /api/reports endpoint is connected
const buildMonthlyDummy = () =>
  MONTHS.map((m, i) => ({ month: m, masuk: 0, keluar: 0, _i: i }))

// Carbon type labels
const CARBON_LABELS = { twill: 'Twill', forged: 'Forged', plain: 'Plain' }

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, iconBg }) {
  return (
    <div className="card-hover" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: iconBg || 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} color={accent || 'var(--accent)'} strokeWidth={1.8} />
        </div>
        {sub && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            {sub}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22,
          fontWeight: 600,
          color: accent || 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 14,
    }}>
      {children}
    </h2>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-active)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => setError('Gagal memuat data dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
        Memuat dashboard...
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--red)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>{error}</div>
    </div>
  )

  const { products, stock, finances, invoices, alerts } = data

  // Bar chart: carbon type distribution from out_of_stock_products
  // We count by type from alerts; ideally comes from a dedicated endpoint
  const carbonTypeMap = {}
  alerts.out_of_stock_products.forEach(p => {
    const t = CARBON_LABELS[p.carbon_type] || p.carbon_type
    carbonTypeMap[t] = (carbonTypeMap[t] || 0) + 1
  })
  const carbonChartData = Object.entries(carbonTypeMap).map(([type, count]) => ({ type, 'Stok Kosong': count }))

  // Line chart: monthly stock flow (dummy — replace with real API later)
  const monthlyData = buildMonthlyDummy()
  // Inject current month actual values
  if (data.period) {
    const idx = data.period.month - 1
    monthlyData[idx].masuk = stock.in_this_month
    monthlyData[idx].keluar = stock.out_this_month
  }
  // Slice to show last 6 months
  const currentMonthIdx = (data.period?.month || 6) - 1
  const last6 = monthlyData.slice(Math.max(0, currentMonthIdx - 5), currentMonthIdx + 1)

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Periode: {MONTHS[(data.period?.month || 1) - 1]} {data.period?.year}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 28,
      }}>
        <StatCard
          icon={Package}
          label="Total Produk"
          value={products.total}
          sub={`${products.active} aktif`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stok Kosong"
          value={products.out_of_stock}
          accent="var(--red)"
          iconBg="var(--red-bg)"
          sub="produk"
        />
        <StatCard
          icon={BarChart3}
          label="Stok Tipis"
          value={products.low_stock}
          accent="#e0a85a"
          iconBg="rgba(224,168,90,0.08)"
          sub="perlu restock"
        />
        <StatCard
          icon={TrendingUp}
          label="Stok Masuk"
          value={stock.in_this_month}
          sub="bulan ini"
        />
        <StatCard
          icon={TrendingDown}
          label="Stok Keluar"
          value={stock.out_this_month}
          sub="bulan ini"
        />
        <StatCard
          icon={FileText}
          label="Faktur"
          value={invoices.count}
          sub={fmt(invoices.amount)}
        />
      </div>

      {/* Finance Summary */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Ringkasan Keuangan</SectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}>
          {[
            { label: 'Pemasukan', value: finances.pemasukan, color: 'var(--green)' },
            { label: 'Pengeluaran', value: finances.pengeluaran, color: 'var(--red)' },
            { label: 'Laba Kotor', value: finances.laba_kotor, color: 'var(--accent)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-hover" style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                {label}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 18,
                fontWeight: 600,
                color,
              }}>
                {fmt(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 28,
      }}>
        {/* Bar Chart — stok kosong per carbon type */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 20px 12px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              Stok Kosong per Carbon Type
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>distribusi produk habis</div>
          </div>
          {carbonChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={carbonChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis dataKey="type" tick={{ fill: '#666', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Stok Kosong" fill="var(--red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              Tidak ada data stok kosong
            </div>
          )}
        </div>

        {/* Line Chart — stok masuk vs keluar per bulan */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 20px 12px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              Stok Masuk vs Keluar
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>6 bulan terakhir</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={last6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', paddingTop: 8 }}
                iconType="circle"
                iconSize={6}
              />
              <Line type="monotone" dataKey="masuk" name="Masuk" stroke="var(--green)" strokeWidth={2} dot={{ r: 3, fill: 'var(--green)' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="keluar" name="Keluar" stroke="var(--red)" strokeWidth={2} dot={{ r: 3, fill: 'var(--red)' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert: Out of Stock Products */}
      {alerts.out_of_stock_products.length > 0 && (
        <div>
          <SectionTitle>Produk Stok Kosong ({alerts.out_of_stock_products.length})</SectionTitle>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SKU', 'Nama Produk', 'Carbon Type', 'Kompatibilitas', 'Stok'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      background: 'var(--bg-main)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.out_of_stock_products.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < alerts.out_of_stock_products.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {p.sku}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        color: p.carbon_type === 'forged' ? 'var(--accent)' : 'var(--text-secondary)',
                        background: p.carbon_type === 'forged' ? 'var(--accent-bg)' : 'rgba(255,255,255,0.04)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        {CARBON_LABELS[p.carbon_type] || p.carbon_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                      {p.vespa_compatibility}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--red)',
                        background: 'var(--red-bg)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        0
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
