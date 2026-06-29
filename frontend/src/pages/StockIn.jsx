import { useState } from 'react'
import { Plus, Trash2, PackageCheck, Download } from 'lucide-react'
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

const CATEGORIES = [
  { value: 'pembelian_stok', label: 'Pembelian Stok' },
  { value: 'produksi', label: 'Produksi' },
]

const inputStyle = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', color: 'var(--text-primary)',
  fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

const monoInput = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function StockIn() {
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
    modal_price: '',
    category: 'pembelian_stok',
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

  // Fetch stock-in records with pagination
  const { data: recordsData, isLoading: loading, refetch, error } = useQuery({
    queryKey: ['stock-in', page],
    queryFn: async () => {
      const res = await api.get('/stock-in', { params: { page } })
      return res.data
    },
  })
  const records = recordsData?.data || []
  const meta = recordsData?.meta || { total_quantity: 0, total_modal: 0 }

  const handlePageChange = (p) => {
    setPage(p)
  }

  // Auto-fill modal_price saat pilih produk
  const handleProductChange = (id) => {
    const p = products.find(p => p.id === Number(id))
    set('product_id', id)
    if (p) set('modal_price', p.modal_price ?? '')
  }

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.product_id) e.product_id = 'Pilih produk'
    if (!form.quantity || Number(form.quantity) < 1) e.quantity = 'Qty minimal 1'
    if (!form.modal_price) e.modal_price = 'Harga modal wajib diisi'
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
      await api.post('/stock-in', {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        modal_price: Number(form.modal_price),
        category: form.category,
        date: form.date,
        notes: form.notes || null,
      })
      setSuccess('Stok masuk berhasil dicatat')
      setForm({ product_id: '', quantity: '', modal_price: '', category: 'pembelian_stok', date: today(), notes: '' })
      refetch()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Gagal mencatat stok masuk')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/stock-in/${id}`)
      refetch()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(null)
      setConfirmDelete({ isOpen: false, id: null })
    }
  }

  const selectedProduct = products.find(p => p.id === Number(form.product_id))
  const totalValue = (Number(form.quantity) || 0) * (Number(form.modal_price) || 0)

  return (
    <div>
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Stok Masuk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Catat pembelian atau produksi stok baru
          </p>
        </div>
        <button
          onClick={() => exportCSV('/stock-in/export', 'stock-in.csv')}
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
            <PackageCheck size={15} color="var(--accent)" />
            Form Stok Masuk
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
              {products.map(p => (
                <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
                  {p.sku} — {p.name} ({p.carbon_type})
                </option>
              ))}
            </select>
            {errors.product_id && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.product_id}</p>}
            {selectedProduct && (
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                Stok saat ini: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: selectedProduct.current_stock === 0 ? 'var(--red)' : 'var(--green)' }}>{selectedProduct.current_stock}</span>
              </p>
            )}
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
            <Field label="Harga Modal *">
              <input
                type="number" min={0}
                value={form.modal_price}
                onChange={e => set('modal_price', e.target.value)}
                placeholder="0"
                style={{ ...monoInput, borderColor: errors.modal_price ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.modal_price ? 'var(--red)' : 'var(--border)'}
              />
              {errors.modal_price && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.modal_price}</p>}
            </Field>
          </div>

          <Field label="Kategori">
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Tanggal *">
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.date ? 'var(--red)' : 'var(--border)', colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.date ? 'var(--red)' : 'var(--border)'}
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

          {/* Total preview */}
          {totalValue > 0 && (
            <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>Total Modal</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
                {fmt(totalValue)}
              </div>
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
            <Plus size={14} />
            {submitting ? 'Menyimpan...' : 'Catat Stok Masuk'}
          </button>
        </div>

        {/* Riwayat */}
        <div>
          {/* Meta stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Qty Masuk', value: meta.total_quantity, mono: true },
              { label: 'Total Nilai Modal', value: fmt(meta.total_modal), mono: true },
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
                Riwayat Stok Masuk
              </h2>
            </div>

            {error ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                Gagal memuat data stok masuk
              </div>
            ) : loading ? (
              <TableSkeleton rows={4} columns={6} />
            ) : records.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
                Belum ada catatan stok masuk
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                    {['Tanggal', 'Produk', 'Kategori', 'Qty', 'Harga Modal', 'Total', 'Catatan', ''].map(h => (
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
                        <span style={{
                          fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                          color: r.category === 'produksi' ? 'var(--accent)' : 'var(--text-secondary)',
                          background: r.category === 'produksi' ? 'var(--accent-bg)' : 'rgba(255,255,255,0.04)',
                          padding: '2px 8px', borderRadius: 4,
                        }}>
                          {r.category === 'pembelian_stok' ? 'Pembelian' : 'Produksi'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
                          +{r.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {fmt(r.modal_price)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
                          {fmt(r.quantity * r.modal_price)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 160 }}>
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
            {!loading && <Pagination meta={meta} onPageChange={handlePageChange} />}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Stok Masuk"
        message="Hapus catatan stok masuk ini? Stok produk akan dikurangi kembali."
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        loading={deleting === confirmDelete.id}
      />
    </div>
  )
}
