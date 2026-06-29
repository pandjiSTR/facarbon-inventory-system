import { useState, useMemo } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const TYPE_CONFIG = {
  stock_in:  { label: 'Stok Masuk',  icon: ArrowDownToLine, color: 'var(--green)', bg: 'var(--green-bg)' },
  stock_out: { label: 'Stok Keluar', icon: ArrowUpFromLine, color: 'var(--red)',   bg: 'var(--red-bg)' },
  finance:   { label: 'Keuangan',    icon: Wallet,          color: 'var(--accent)', bg: 'var(--accent-bg)' },
}

export default function Transactions() {
  const [filterType, setFilterType] = useState('semua')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Fetch up to 5000 records from all three sources
  const { data: stockIns, isLoading: loadingStockIn } = useQuery({
    queryKey: ['stock-in', 5000],
    queryFn: async () => {
      const res = await api.get('/stock-in?per_page=5000')
      return res.data.data || []
    },
  })
  const { data: stockOuts, isLoading: loadingStockOut } = useQuery({
    queryKey: ['stock-out', 5000],
    queryFn: async () => {
      const res = await api.get('/stock-out?per_page=5000')
      return res.data.data || []
    },
  })
  const { data: finances, isLoading: loadingFinance } = useQuery({
    queryKey: ['finances', 5000],
    queryFn: async () => {
      const res = await api.get('/finances?per_page=5000')
      return res.data.data || []
    },
  })
  const loading = loadingStockIn || loadingStockOut || loadingFinance

  // Gabungkan semua jadi satu list transaksi terstandarisasi
  const combined = useMemo(() => {
    const inItems = stockIns.map(r => ({
      id: `stock_in_${r.id}`,
      type: 'stock_in',
      date: r.date,
      description: `Stok masuk: ${r.product?.name || '-'} (${r.product?.sku || '-'}) x${r.quantity}`,
      amount: r.quantity * r.modal_price,
      sign: '+',
      qty: r.quantity,
      raw: r,
    }))

    const outItems = stockOuts.map(r => ({
      id: `stock_out_${r.id}`,
      type: 'stock_out',
      date: r.date,
      description: `Stok keluar: ${r.product?.name || '-'} (${r.product?.sku || '-'}) x${r.quantity} via ${r.channel}`,
      amount: r.quantity * r.sell_price,
      sign: '-',
      qty: r.quantity,
      raw: r,
    }))

    // Hanya finance yang BUKAN otomatis dari stock_in/stock_out (untuk hindari duplikasi tampilan)
    // Tapi karena finance otomatis sudah terwakili oleh stock_in/stock_out di atas,
    // kita tampilkan finance manual saja (yang stock_in_id & stock_out_id null)
    const financeItems = finances
      .filter(f => !f.stock_in_id && !f.stock_out_id)
      .map(r => ({
        id: `finance_${r.id}`,
        type: 'finance',
        date: r.date,
        description: r.description,
        amount: r.amount,
        sign: r.type === 'kredit' ? '+' : '-',
        qty: null,
        raw: r,
      }))

    return [...inItems, ...outItems, ...financeItems].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [stockIns, stockOuts, finances])

  const filtered = useMemo(() => {
    return combined.filter(item => {
      if (filterType !== 'semua' && item.type !== filterType) return false
      if (dateFrom && item.date < dateFrom) return false
      if (dateTo && item.date > dateTo) return false
      return true
    })
  }, [combined, filterType, dateFrom, dateTo])

  const totals = useMemo(() => {
    const totalIn = filtered.filter(i => i.type === 'stock_in').reduce((s, i) => s + i.amount, 0)
    const totalOut = filtered.filter(i => i.type === 'stock_out').reduce((s, i) => s + i.amount, 0)
    const totalFinance = filtered.filter(i => i.type === 'finance')
      .reduce((s, i) => s + (i.sign === '+' ? i.amount : -i.amount), 0)
    return { totalIn, totalOut, totalFinance, count: filtered.length }
  }, [filtered])

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Riwayat Transaksi
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Histori gabungan stok masuk, stok keluar, dan catatan keuangan
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Transaksi', value: totals.count, mono: true, color: 'var(--text-primary)' },
          { label: 'Nilai Stok Masuk', value: fmt(totals.totalIn), color: 'var(--green)' },
          { label: 'Nilai Stok Keluar', value: fmt(totals.totalOut), color: 'var(--red)' },
          { label: 'Keuangan Manual', value: fmt(totals.totalFinance), color: totals.totalFinance >= 0 ? 'var(--accent)' : 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
        padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          <Filter size={13} />
          <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Filter</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[['semua', 'Semua'], ['stock_in', 'Stok Masuk'], ['stock_out', 'Stok Keluar'], ['finance', 'Keuangan']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                background: filterType === val ? 'var(--accent)' : 'var(--bg-elevated)',
                color: filterType === val ? '#0d0d0d' : 'var(--text-secondary)',
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace', colorScheme: 'dark', outline: 'none',
          }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6,
            padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace', colorScheme: 'dark', outline: 'none',
          }} />

        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>
            Reset tanggal
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            Tidak ada transaksi ditemukan
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                {['Tanggal', 'Jenis', 'Deskripsi', 'Qty', 'Nominal'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const cfg = TYPE_CONFIG[item.type]
                const Icon = cfg.icon
                return (
                  <tr key={item.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                      {fmtDate(item.date)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                        color: cfg.color, background: cfg.bg,
                        padding: '3px 9px', borderRadius: 4,
                      }}>
                        <Icon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 360 }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {item.qty != null ? (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {item.qty}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
                        color: item.sign === '+' ? 'var(--green)' : 'var(--red)',
                      }}>
                        {item.sign}{fmt(item.amount)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>
          Menampilkan {filtered.length} dari {combined.length} transaksi
        </div>
      )}
    </div>
  )
}
