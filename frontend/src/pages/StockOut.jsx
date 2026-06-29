import { useState } from 'react'
import { Trash2, TrendingDown, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import exportCSV from '../utils/exportCSV'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const today = () => new Date().toISOString().split('T')[0]

const CHANNELS = [
  { value: 'reseller', label: 'Reseller', color: 'var(--accent)', bg: 'var(--accent-bg)' },
  { value: 'online',   label: 'Online',   color: '#a0c4ff', bg: 'rgba(160,196,255,0.08)' },
  { value: 'langsung', label: 'Langsung', color: 'var(--green)', bg: 'var(--green-bg)' },
]

const inputStyle = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', color: 'var(--text-primary)',
  fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

const monoInput = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{hint}</p>}
    </div>
  )
}

function ChannelBadge({ channel }) {
  const c = CHANNELS.find(ch => ch.value === channel) || CHANNELS[0]
  return (
    <span style={{
      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
      color: c.color, background: c.bg,
      padding: '2px 8px', borderRadius: 4,
    }}>
      {c.label}
    </span>
  )
}

export default function StockOut() {
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [page, setPage] = useState(1)
  const [success, setSuccess] = useState('')
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })

  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    channel: 'reseller',
    sell_price: '',
    date: today(),
    notes: '',
  })

  // Fetch products list
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products')
      return res.data.data || []
    },
  })
  const products = productsData || []

  // Fetch stock-out records with pagination
  const { data: recordsData, isLoading: loading, refetch } = useQuery({
    queryKey: ['stock-out', page],
    queryFn: async () => {
      const res = await api.get('/stock-out', { params: { page } })
      return res.data
    },
  })
  const records = recordsData?.data || []
  const meta = recordsData?.meta || { total_quantity: 0, total_revenue: 0 }

  const handlePageChange = (p) => {
    setPage(p)
  }

  // Auto-fill sell_price berdasarkan channel yang dipilih
  const updateSellPrice = (productId, channel) => {
    const p = products.find(p => p.id === Number(productId))
    if (!p) return
    if (channel === 'reseller') setForm(f => ({ ...f, sell_price: p.reseller_price ?? '' }))
    else if (channel === 'online') setForm(f => ({ ...f, sell_price: p.online_price ?? '' }))
    else setForm(f => ({ ...f, sell_price: p.reseller_price ?? '' }))
  }

  const handleProductChange = (id) => {
    set('product_id', id)
    updateSellPrice(id, form.channel)
  }

  const handleChannelChange = (channel) => {
    set('channel', channel)
    updateSellPrice(form.product_id, channel)
  }

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.product_id) e.product_id = 'Pilih produk'
    if (!form.quantity || Number(form.quantity) < 1) e.quantity = 'Qty minimal 1'
    if (!form.sell_price) e.sell_price = 'Harga jual wajib diisi'
    if (!form.date) e.date = 'Tanggal wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setServerError('')
    setSuccess('')
    try {
      const res = await api.post('/stock-out', {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        channel: form.channel,
        sell_price: Number(form.sell_price),
        date: form.date,
        notes: form.notes || null,
      })
      const msg = res.data.message || 'Stok keluar berhasil dicatat'
      setSuccess(msg)
      setForm({ product_id: '', quantity: '', channel: 'reseller', sell_price: '', date: today(), notes: '' })
      refetch()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Gagal mencatat stok keluar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/stock-out/${id}`)
      refetch()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(null)
      setConfirmDelete({ isOpen: false, id: null })
    }
  }

  const selectedProduct = products.find(p => p.id === Number(form.product_id))
  const totalValue = (Number(form.quantity) || 0) * (Number(form.sell_price) || 0)
  const totalModal = selectedProduct ? (Number(form.quantity) || 0) * selectedProduct.modal_price : 0
  const estimasiLaba = totalValue - totalModal

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Stok Keluar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Catat penjualan produk via reseller, online, atau langsung
          </p>
        </div>
        <button
          onClick={() => exportCSV('/stock-out/export', 'stock-out.csv')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '9px 16px', cursor: 'pointer',
            color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
            fontSize: 13, fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={15} color="var(--red)" />
            Form Stok Keluar
          </h2>

          {serverError && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
              {serverError}
            </div>
          )}
          {success && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(90,158,90,0.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--green)', fontFamily: 'Inter, sans-serif' }}>
              {success}
            </div>
          )}

          <Field label="Produk *">
            <select
              value={form.product_id}
              onChange={e => handleProductChange(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.product_id ? 'var(--red)' : 'var(--border)', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.product_id ? 'var(--red)' : 'var(--border)'}
            >
              <option value="" style={{ background: 'var(--bg-elevated)' }}>— Pilih produk —</option>
              {products.filter(p => p.current_stock > 0).map(p => (
                <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
                  {p.sku} — {p.name} (stok: {p.current_stock})
                </option>
              ))}
            </select>
            {errors.product_id && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.product_id}</p>}
            {selectedProduct && (
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                Stok tersedia: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)' }}>{selectedProduct.current_stock}</span>
              </p>
            )}
          </Field>

          {/* Channel selector */}
          <Field label="Channel Penjualan">
            <div style={{ display: 'flex', gap: 6 }}>
              {CHANNELS.map(ch => (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => handleChannelChange(ch.value)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    border: form.channel === ch.value ? `1px solid ${ch.color}` : '1px solid var(--border)',
                    background: form.channel === ch.value ? ch.bg : 'var(--bg-elevated)',
                    color: form.channel === ch.value ? ch.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Jumlah (Qty) *">
              <input
                type="number" min={1}
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                placeholder="0"
                style={{ ...monoInput, borderColor: errors.quantity ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.quantity ? 'var(--red)' : 'var(--border)'}
              />
              {errors.quantity && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.quantity}</p>}
            </Field>
            <Field label="Harga Jual *" hint="Bisa diedit manual">
              <input
                type="number" min={0}
                value={form.sell_price}
                onChange={e => set('sell_price', e.target.value)}
                placeholder="0"
                style={{ ...monoInput, borderColor: errors.sell_price ? 'var(--red)' : 'var(--accent)', borderWidth: 1 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.sell_price ? 'var(--red)' : 'rgba(200,169,110,0.4)'}
              />
              {errors.sell_price && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.sell_price}</p>}
            </Field>
          </div>

          <Field label="Tanggal *">
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>

          <Field label="Catatan">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Opsional..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>

          {/* Preview kalkulasi */}
          {totalValue > 0 && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                <span>Total Penjualan</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)' }}>{fmt(totalValue)}</span>
              </div>
              {totalModal > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                    <span>Total Modal</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--red)' }}>{fmt(totalModal)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Estimasi Laba</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: estimasiLaba >= 0 ? 'var(--accent)' : 'var(--red)' }}>
                      {fmt(estimasiLaba)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
              border: 'none', borderRadius: 8, padding: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <TrendingDown size={14} />
            {submitting ? 'Menyimpan...' : 'Catat Stok Keluar'}
          </button>
        </div>

        {/* Riwayat */}
        <div>
          {/* Meta stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Qty Keluar', value: meta.total_quantity },
              { label: 'Total Pendapatan', value: fmt(meta.total_revenue) },
            ].map(({ label, value }) => (
              <div key={label} className="card-hover" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Riwayat Stok Keluar
              </h2>
            </div>

            {loading ? (
              <TableSkeleton rows={4} columns={6} />
            ) : records.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                Belum ada catatan stok keluar
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                    {['Tanggal', 'Produk', 'Channel', 'Qty', 'Harga Jual', 'Total', 'Catatan', ''].map(h => (
                      <th key={h} style={{
                        padding: '9px 14px', textAlign: 'left',
                        fontSize: 11, fontFamily: 'Inter, sans-serif',
                        fontWeight: 600, color: 'var(--text-muted)',
                        letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        {fmtDate(r.date)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.product?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{r.product?.sku}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <ChannelBadge channel={r.channel} />
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
                          -{r.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {fmt(r.sell_price)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--green)' }}>
                          {fmt(r.quantity * r.sell_price)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 140 }}>
                        {r.notes || '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => setConfirmDelete({ isOpen: true, id: r.id })}
                          disabled={deleting === r.id}
                          style={{
                            background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)',
                            borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', color: 'var(--red)',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {!loading && <Pagination meta={meta} onPageChange={handlePageChange} />}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Stok Keluar"
        message="Hapus catatan stok keluar ini? Stok produk akan dikembalikan."
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        loading={deleting === confirmDelete.id}
      />
    </div>
  )
}
