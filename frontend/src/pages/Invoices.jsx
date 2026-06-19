import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Plus, Trash2, Printer, X, FileText, ChevronDown } from 'lucide-react'
import api from '../api/axios'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

const today = () => new Date().toISOString().split('T')[0]

const STATUS = [
  { value: 'draft',     label: 'Draft',     color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)' },
  { value: 'confirmed', label: 'Confirmed', color: 'var(--accent)', bg: 'var(--accent-bg)' },
  { value: 'paid',      label: 'Paid',      color: 'var(--green)', bg: 'var(--green-bg)' },
]

const CHANNELS = [
  { value: 'reseller', label: 'Reseller' },
  { value: 'online',   label: 'Online' },
  { value: 'langsung', label: 'Langsung' },
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

function StatusBadge({ status }) {
  const s = STATUS.find(x => x.value === status) || STATUS[0]
  return (
    <span style={{
      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
      color: s.color, background: s.bg,
      padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  )
}

// ── Print-friendly invoice document ──────────────────────────────────────────
function InvoiceDocument({ invoice }) {
  if (!invoice) return null
  return (
    <div style={{
      background: '#fff', color: '#18181b', padding: 40,
      fontFamily: 'DM Sans, sans-serif', width: '100%', minHeight: '100%',
    }}>
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, borderBottom: '2px solid #18181b', paddingBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.04em', color: '#18181b' }}>
            FACARBON
          </div>
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.08em' }}>VESPA CARBON ACCESSORIES</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#18181b' }}>INVOICE</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#71717a' }}>{invoice.invoice_number}</div>
        </div>
      </div>

      {/* Buyer info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Kepada</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#18181b' }}>{invoice.buyer_name}</div>
          {invoice.buyer_contact && <div style={{ fontSize: 12, color: '#52525b', marginTop: 2 }}>{invoice.buyer_contact}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Tanggal</div>
          <div style={{ fontSize: 13, color: '#18181b' }}>{fmtDate(invoice.date)}</div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #18181b' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Produk</th>
            <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Harga</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 11, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e4e4e7' }}>
              <td style={{ padding: '10px 4px' }}>
                <div style={{ fontSize: 13, color: '#18181b' }}>{item.product_name}</div>
                <div style={{ fontSize: 10, color: '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}>{item.product_sku}</div>
              </td>
              <td style={{ padding: '10px 4px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{item.quantity}</td>
              <td style={{ padding: '10px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{fmt(item.unit_price)}</td>
              <td style={{ padding: '10px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600 }}>{fmt(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #18181b', paddingTop: 10 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>TOTAL</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 16 }}>{fmt(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Catatan</div>
          <div style={{ fontSize: 12, color: '#52525b' }}>{invoice.notes}</div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 10, color: '#a1a1aa', marginTop: 40, borderTop: '1px solid #e4e4e7', paddingTop: 16 }}>
        Terima kasih telah berbelanja di Facarbon
      </div>
    </div>
  )
}

export default function Invoices() {
  const [products, setProducts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [meta, setMeta] = useState({ total: 0, total_amount: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState(null)
  const [serverError, setServerError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    buyer_name: '', buyer_contact: '', date: today(),
    status: 'confirmed', notes: '',
  })
  const [items, setItems] = useState([
    { product_id: '', quantity: 1, unit_price: '', channel: 'reseller' },
  ])

  const printRef = useRef()
  const handlePrint = useReactToPrint({ contentRef: printRef })

  const fetchInvoices = () => {
    api.get('/invoices')
      .then(res => {
        setInvoices(res.data.data || [])
        setMeta(res.data.meta || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data.data || [])).catch(() => {})
    fetchInvoices()
  }, [])

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1, unit_price: '', channel: 'reseller' }])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, key, val) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it
      const updated = { ...it, [key]: val }
      // Auto-fill harga saat pilih produk atau ganti channel
      if (key === 'product_id' || key === 'channel') {
        const p = products.find(p => p.id === Number(updated.product_id))
        if (p) {
          updated.unit_price = updated.channel === 'online' ? (p.online_price ?? p.reseller_price) : p.reseller_price
        }
      }
      return updated
    }))
  }

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0)

  const setF = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.buyer_name.trim()) e.buyer_name = 'Nama pembeli wajib diisi'
    if (!form.date) e.date = 'Tanggal wajib diisi'
    const itemErrors = items.some(it => !it.product_id || !it.quantity || !it.unit_price)
    if (itemErrors) e.items = 'Lengkapi semua item (produk, qty, harga)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const resetForm = () => {
    setForm({ buyer_name: '', buyer_contact: '', date: today(), status: 'confirmed', notes: '' })
    setItems([{ product_id: '', quantity: 1, unit_price: '', channel: 'reseller' }])
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setServerError('')
    try {
      const res = await api.post('/invoices', {
        ...form,
        items: items.map(it => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          channel: it.channel,
        })),
      })
      setShowForm(false)
      resetForm()
      fetchInvoices()
      // Tampilkan preview invoice yang baru dibuat
      setPreviewInvoice(res.data.data)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Gagal membuat invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus invoice ini? Stok yang sudah terjual akan dikembalikan.')) return
    setDeleting(id)
    try {
      await api.delete(`/invoices/${id}`)
      fetchInvoices()
    } catch {
      alert('Gagal menghapus invoice')
    } finally {
      setDeleting(null)
    }
  }

  const openPreview = async (inv) => {
    try {
      const res = await api.get(`/invoices/${inv.id}`)
      setPreviewInvoice(res.data.data)
    } catch {
      setPreviewInvoice(inv)
    }
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Faktur
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {meta.total} faktur · Total {fmt(meta.total_amount)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            padding: '9px 16px', cursor: 'pointer',
            color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={14} />
          Buat Faktur
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Buat Faktur Baru
            </h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          {serverError && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)', borderRadius: 8, padding: '9px 12px', marginBottom: 14, fontSize: 12, color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
              {serverError}
            </div>
          )}

          {/* Buyer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 160px', gap: 12, marginBottom: 16 }}>
            <Field label="Nama Pembeli *">
              <input value={form.buyer_name} onChange={e => setF('buyer_name', e.target.value)}
                placeholder="cth: Budi Santoso"
                style={{ ...inputStyle, borderColor: errors.buyer_name ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.buyer_name ? 'var(--red)' : 'var(--border)'} />
            </Field>
            <Field label="Kontak">
              <input value={form.buyer_contact} onChange={e => setF('buyer_contact', e.target.value)}
                placeholder="No. HP / email"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <Field label="Tanggal *">
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setF('status', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                {STATUS.map(s => <option key={s.value} value={s.value} style={{ background: 'var(--bg-elevated)' }}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Item Faktur
              </span>
              {errors.items && <span style={{ fontSize: 11, color: 'var(--red)' }}>{errors.items}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => {
                const p = products.find(p => p.id === Number(item.product_id))
                const subtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                return (
                  <div key={idx} style={{
                    display: 'grid', gridTemplateColumns: '1.6fr 90px 110px 130px 120px 32px',
                    gap: 8, alignItems: 'start', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 8, padding: 10,
                  }}>
                    <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }}>
                      <option value="" style={{ background: 'var(--bg-elevated)' }}>— Pilih produk —</option>
                      {products.filter(p => p.current_stock > 0).map(p => (
                        <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
                          {p.sku} — {p.name} (stok: {p.current_stock})
                        </option>
                      ))}
                    </select>
                    <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      style={{ ...monoInput, padding: '7px 10px', fontSize: 12 }} />
                    <select value={item.channel} onChange={e => updateItem(idx, 'channel', e.target.value)}
                      style={{ ...inputStyle, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }}>
                      {CHANNELS.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.label}</option>)}
                    </select>
                    <input type="number" min={0} value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                      placeholder="Harga (nego)"
                      style={{ ...monoInput, padding: '7px 10px', fontSize: 12, borderColor: 'rgba(200,169,110,0.3)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)', padding: '7px 0' }}>
                      {fmt(subtotal)}
                    </div>
                    <button onClick={() => removeItem(idx)} disabled={items.length === 1}
                      style={{
                        background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)', borderRadius: 6,
                        padding: '7px', cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: items.length === 1 ? 0.4 : 1,
                      }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>

            <button onClick={addItem} style={{
              marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px dashed var(--border-active)', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer', color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif', fontSize: 12,
            }}>
              <Plus size={12} /> Tambah Item
            </button>
          </div>

          {/* Notes + Total */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, marginBottom: 16, alignItems: 'end' }}>
            <Field label="Catatan">
              <input value={form.notes} onChange={e => setF('notes', e.target.value)}
                placeholder="Opsional..."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 8, padding: '10px 14px', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Total Faktur</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{fmt(grandTotal)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); resetForm() }}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{
                background: submitting ? 'var(--accent-dim)' : 'var(--accent)', border: 'none', borderRadius: 8,
                padding: '9px 18px', cursor: submitting ? 'not-allowed' : 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              }}>
              {submitting ? 'Menyimpan...' : 'Buat Faktur'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Memuat data...</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Belum ada faktur dibuat</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                {['No. Invoice', 'Tanggal', 'Pembeli', 'Items', 'Total', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id}
                  style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => openPreview(inv)}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>{inv.invoice_number}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                    {fmtDate(inv.date)}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {inv.buyer_name}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {inv.items?.length || 0} item
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      {fmt(inv.total_amount)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDelete(inv.id)} disabled={deleting === inv.id}
                      style={{
                        background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)', borderRadius: 6,
                        padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--red)',
                      }}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {previewInvoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24,
        }} onClick={() => setPreviewInvoice(null)}>
          <div
            style={{
              background: 'var(--bg-surface)', borderRadius: 12, maxWidth: 640, width: '100%',
              maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="var(--accent)" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Preview Faktur
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handlePrint} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--accent)', border: 'none', borderRadius: 6,
                  padding: '6px 12px', cursor: 'pointer', color: '#0d0d0d',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                }}>
                  <Printer size={12} /> Cetak / PDF
                </button>
                <button onClick={() => setPreviewInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div ref={printRef}>
              <InvoiceDocument invoice={previewInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
