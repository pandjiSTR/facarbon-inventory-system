import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import api from '../api/axios'

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

const today = () => new Date().toISOString().split('T')[0]

const CATEGORIES = [
  { value: 'pembelian_stok', label: 'Pembelian Stok' },
  { value: 'produksi',       label: 'Produksi' },
  { value: 'penjualan',      label: 'Penjualan' },
  { value: 'operasional',    label: 'Operasional' },
  { value: 'lain_lain',      label: 'Lain-lain' },
]

const TYPES = [
  { value: 'kredit', label: 'Kredit (Pemasukan)', color: 'var(--green)' },
  { value: 'debit',  label: 'Debit (Pengeluaran)', color: 'var(--red)' },
]

const CAT_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

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

export default function Finances() {
  const [records, setRecords] = useState([])
  const [meta, setMeta] = useState({ total_kredit: 0, total_debit: 0, saldo: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const [form, setForm] = useState({
    date: today(),
    description: '',
    category: 'operasional',
    type: 'debit',
    amount: '',
    notes: '',
  })

  const fetchRecords = (type = filterType, cat = filterCat) => {
    const params = {}
    if (type) params.type = type
    if (cat) params.category = cat
    api.get('/finances', { params })
      .then(res => {
        setRecords(res.data.data || [])
        setMeta(res.data.meta || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRecords() }, [])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi'
    if (!form.amount || Number(form.amount) < 1) e.amount = 'Nominal wajib diisi'
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
      await api.post('/finances', {
        ...form,
        amount: Number(form.amount),
      })
      setSuccess('Catatan keuangan berhasil ditambahkan')
      setForm({ date: today(), description: '', category: 'operasional', type: 'debit', amount: '', notes: '' })
      setShowForm(false)
      fetchRecords()
    } catch (err) {
      setServerError(err.response?.data?.message || 'Gagal menyimpan catatan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFilter = (type, cat) => {
    setFilterType(type)
    setFilterCat(cat)
    setLoading(true)
    fetchRecords(type, cat)
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Keuangan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Ringkasan arus kas & catatan keuangan
          </p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            padding: '9px 16px', cursor: 'pointer',
            color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={14} />
          Tambah Manual
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Pemasukan', value: fmt(meta.total_kredit), color: 'var(--green)', icon: TrendingUp, bg: 'var(--green-bg)' },
          { label: 'Total Pengeluaran', value: fmt(meta.total_debit), color: 'var(--red)', icon: TrendingDown, bg: 'var(--red-bg)' },
          { label: 'Saldo', value: fmt(meta.saldo), color: meta.saldo >= 0 ? 'var(--accent)' : 'var(--red)', icon: Wallet, bg: 'var(--accent-bg)' },
        ].map(({ label, value, color, icon: Icon, bg }) => (
          <div key={label} className="card-hover" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Form tambah manual */}
      {showForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Tambah Catatan Manual
          </h2>

          {serverError && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)', borderRadius: 8, padding: '9px 12px', marginBottom: 14, fontSize: 12, color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
              {serverError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
            <Field label="Tanggal *">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <Field label="Kategori">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Tipe">
              <div style={{ display: 'flex', gap: 6 }}>
                {TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => set('type', t.value)}
                    style={{
                      flex: 1, padding: '9px 8px', borderRadius: 8, cursor: 'pointer',
                      fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      border: form.type === t.value ? `1px solid ${t.color}` : '1px solid var(--border)',
                      background: form.type === t.value ? (t.value === 'kredit' ? 'var(--green-bg)' : 'var(--red-bg)') : 'var(--bg-elevated)',
                      color: form.type === t.value ? t.color : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}>
                    {t.value === 'kredit' ? 'Kredit' : 'Debit'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14, marginBottom: 14 }}>
            <Field label="Deskripsi *">
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="cth: Beli bahan baku carbon"
                style={{ ...inputStyle, borderColor: errors.description ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.description ? 'var(--red)' : 'var(--border)'} />
              {errors.description && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.description}</p>}
            </Field>
            <Field label="Nominal (Rp) *">
              <input type="number" min={1} value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0"
                style={{ ...monoInput, borderColor: errors.amount ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.amount ? 'var(--red)' : 'var(--border)'} />
              {errors.amount && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.amount}</p>}
            </Field>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Field label="Catatan">
              <input value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Opsional..."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{
                background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none', borderRadius: 8, padding: '8px 16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              }}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(90,158,90,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--green)', fontFamily: 'Inter, sans-serif' }}>
          {success}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['', 'Semua Tipe'], ['kredit', 'Kredit'], ['debit', 'Debit']].map(([val, label]) => (
          <button key={val} onClick={() => handleFilter(val, filterCat)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
              background: filterType === val ? 'var(--accent)' : 'var(--bg-surface)',
              color: filterType === val ? '#0d0d0d' : 'var(--text-secondary)',
              border: `1px solid ${filterType === val ? 'var(--accent)' : 'var(--border)'}`,
            }}>
            {label}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {[['', 'Semua Kategori'], ...CATEGORIES.map(c => [c.value, c.label])].map(([val, label]) => (
          <button key={val} onClick={() => handleFilter(filterType, val)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
              background: filterCat === val ? 'var(--accent-bg)' : 'var(--bg-surface)',
              color: filterCat === val ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${filterCat === val ? 'rgba(200,169,110,0.3)' : 'var(--border)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Memuat data...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Belum ada catatan keuangan</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                {['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Nominal', 'Catatan'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id}
                  style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                    {fmtDate(r.date)}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 280 }}>
                    {r.description}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {CAT_LABELS[r.category] || r.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      color: r.type === 'kredit' ? 'var(--green)' : 'var(--red)',
                      background: r.type === 'kredit' ? 'var(--green-bg)' : 'var(--red-bg)',
                      padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                    }}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
                      color: r.type === 'kredit' ? 'var(--green)' : 'var(--red)',
                    }}>
                      {r.type === 'kredit' ? '+' : '-'}{fmt(r.amount)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 180 }}>
                    {r.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && records.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>
          {records.length} catatan
        </div>
      )}
    </div>
  )
}
