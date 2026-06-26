import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, Trash2, ImageOff } from 'lucide-react'
import api from '../api/axios'

const CARBON_TYPES = ['twill', 'forged', 'plain']

const VESPA_OPTIONS = [
  'Universal',
  'Sprint',
  'Sprint S',
  'Sprint 2024',
  'Sprint 2025',
  'LX',
  'LX S',
  'S Facelift',
]

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 12, fontFamily: 'Inter, sans-serif',
        fontWeight: 500, color: 'var(--text-secondary)',
      }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{hint}</p>}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', color: 'var(--text-primary)',
  fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

const monoInputStyle = { ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', sku: '', carbon_type: 'twill',
    vespa_compatibility: [],
    modal_price: '', reseller_price: '', online_price: '',
    min_stock: 2,
  })
  const [customVespa, setCustomVespa] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [photo, setPhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`)
      .then(res => {
        const p = res.data.data || res.data
        setForm({
          name: p.name || '',
          sku: p.sku || '',
          carbon_type: p.carbon_type || 'twill',
          vespa_compatibility: Array.isArray(p.vespa_compatibility) ? p.vespa_compatibility : [p.vespa_compatibility],
          modal_price: p.modal_price ?? '',
          reseller_price: p.reseller_price ?? '',
          online_price: p.online_price ?? '',
          min_stock: p.min_stock ?? 2,
        })
        if (p.photo_url) setPreviewUrl(p.photo_url)
      })
      .catch(() => setServerError('Gagal memuat data produk'))
      .finally(() => setFetchLoading(false))

    // Cleanup object URLs on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [id, isEdit])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const toggleVespa = (val) => {
    setForm(f => {
      const cur = f.vespa_compatibility
      const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]
      return { ...f, vespa_compatibility: next }
    })
    setErrors(e => ({ ...e, vespa_compatibility: undefined }))
  }

  const addCustomVespa = () => {
    const val = customVespa.trim()
    if (!val) return
    if (!form.vespa_compatibility.includes(val)) {
      set('vespa_compatibility', [...form.vespa_compatibility, val])
    }
    setCustomVespa('')
  }

  const removeVespa = (val) => {
    set('vespa_compatibility', form.vespa_compatibility.filter(v => v !== val))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi'
    if (!form.sku.trim()) e.sku = 'SKU wajib diisi'
    if (form.vespa_compatibility.length === 0) e.vespa_compatibility = 'Pilih minimal 1 kompatibilitas'
    if (!form.modal_price) e.modal_price = 'Harga modal wajib diisi'
    if (!form.reseller_price) e.reseller_price = 'Harga reseller wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setServerError('')

    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('sku', form.sku.trim())
    formData.append('carbon_type', form.carbon_type)
    formData.append('modal_price', Number(form.modal_price))
    formData.append('reseller_price', Number(form.reseller_price))
    if (form.online_price) formData.append('online_price', Number(form.online_price))

    // Vespa compatibility array
    form.vespa_compatibility.forEach(v => formData.append('vespa_compatibility[]', v))

    // Photo
    if (photo) {
      formData.append('photo', photo)
    }
    if (removePhoto) {
      formData.append('remove_photo', '1')
    }

    try {
      if (isEdit) {
        formData.append('_method', 'PUT')
        await api.post(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      navigate('/products')
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan produk'
      const valErrors = err.response?.data?.errors || {}
      setServerError(msg)
      setErrors(valErrors)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Memuat data...</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 9px', cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {isEdit ? `Mengedit produk #${id}` : 'Buat produk carbon baru'}
          </p>
        </div>
      </div>

      {serverError && (
        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: 'var(--red)', fontFamily: 'Inter, sans-serif',
        }}>
          {serverError}
        </div>
      )}

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Nama + SKU */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14 }}>
          <Field label="Nama Produk *">
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="cth: Horn Cover Sprint S"
              style={{ ...inputStyle, borderColor: errors.name ? 'var(--red)' : 'var(--border)' }}
              onFocus={e => e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--border)'}
            />
            {errors.name && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.name}</p>}
          </Field>
          <Field label="SKU *">
            <input
              value={form.sku}
              onChange={e => set('sku', e.target.value.toUpperCase())}
              placeholder="FAC-001"
              style={{ ...monoInputStyle, borderColor: errors.sku ? 'var(--red)' : 'var(--border)' }}
              onFocus={e => e.target.style.borderColor = errors.sku ? 'var(--red)' : 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.sku ? 'var(--red)' : 'var(--border)'}
            />
            {errors.sku && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.sku}</p>}
          </Field>
        </div>

        {/* Carbon type */}
        <Field label="Carbon Type">
          <div style={{ display: 'flex', gap: 8 }}>
            {CARBON_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('carbon_type', t)}
                style={{
                  padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  border: form.carbon_type === t ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: form.carbon_type === t ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                  color: form.carbon_type === t ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Field>

        {/* Kompatibilitas Vespa — checklist */}
        <Field label="Kompatibilitas Vespa *" hint="Pilih semua tipe Vespa yang kompatibel dengan produk ini">
          <div style={{
            border: errors.vespa_compatibility ? '1px solid var(--red)' : '1px solid var(--border)',
            borderRadius: 8, padding: 12, background: 'var(--bg-elevated)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
              {VESPA_OPTIONS.map(v => {
                const checked = form.vespa_compatibility.includes(v)
                return (
                  <label
                    key={v}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      cursor: 'pointer', padding: '6px 8px', borderRadius: 6,
                      background: checked ? 'var(--accent-bg)' : 'transparent',
                      border: checked ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: checked ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: checked ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: checked ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {v}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVespa(v)}
                      style={{ display: 'none' }}
                    />
                  </label>
                )
              })}
            </div>

            {/* Custom vespa input */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 8 }}>
              <input
                value={customVespa}
                onChange={e => setCustomVespa(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomVespa())}
                placeholder="Tambah tipe lain..."
                style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 12 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={addCustomVespa}
                style={{
                  background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: 'var(--accent)', fontSize: 12, fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                + Tambah
              </button>
            </div>

            {/* Selected tags */}
            {form.vespa_compatibility.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.vespa_compatibility.map(v => (
                  <span key={v} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
                    color: 'var(--accent)', fontSize: 11, fontFamily: 'Inter, sans-serif',
                    padding: '3px 8px', borderRadius: 99,
                  }}>
                    {v}
                    <button
                      type="button"
                      onClick={() => removeVespa(v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0, lineHeight: 1, fontSize: 13 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {errors.vespa_compatibility && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.vespa_compatibility}</p>}
        </Field>

        {/* Foto Produk */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
            Foto Produk
          </p>
          <div style={{
            border: '1px solid var(--border)', borderRadius: 8, padding: 16,
            background: 'var(--bg-elevated)',
          }}>
            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              {previewUrl ? (
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: 100, height: 100, borderRadius: 8,
                      objectFit: 'cover', border: '1px solid var(--border)',
                    }}
                  />
                  {isEdit && !removePhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null)
                        setRemovePhoto(true)
                        setPreviewUrl(null)
                      }}
                      title="Hapus foto"
                      style={{
                        position: 'absolute', top: -6, right: -6, zIndex: 1,
                        background: 'var(--red)', border: 'none', borderRadius: '50%',
                        width: 22, height: 22, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  width: 100, height: 100, borderRadius: 8,
                  border: '1px dashed var(--border)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', gap: 4, flexShrink: 0,
                }}>
                  <ImageOff size={24} style={{ opacity: 0.4 }} />
                  <span style={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }}>Belum ada foto</span>
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setPhoto(file)
                    setRemovePhoto(false)
                    // Revoke old blob URL if any
                    if (previewUrl && previewUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(previewUrl)
                    }
                    setPreviewUrl(URL.createObjectURL(file))
                  }}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
                    borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                    color: 'var(--accent)', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  }}
                >
                  <Upload size={14} />
                  {previewUrl ? 'Ganti Foto' : 'Upload Foto'}
                </button>
                <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                  JPG, PNG, atau WebP. Maks 2MB.
                </p>
              </div>
            </div>

            {/* Keterangan foto existing */}
            {isEdit && previewUrl && !removePhoto && !photo && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                Foto saat ini. Klik "Ganti Foto" untuk upload ulang.
              </p>
            )}
            {removePhoto && (
              <p style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'Inter, sans-serif' }}>
                Foto akan dihapus saat disimpan.
              </p>
            )}
          </div>
        </div>

        {/* Harga */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
            Harga
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <Field label="Harga Modal (HPP) *">
              <input
                type="number"
                value={form.modal_price}
                onChange={e => set('modal_price', e.target.value)}
                placeholder="0"
                style={{ ...monoInputStyle, borderColor: errors.modal_price ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = errors.modal_price ? 'var(--red)' : 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.modal_price ? 'var(--red)' : 'var(--border)'}
              />
              {errors.modal_price && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.modal_price}</p>}
            </Field>
            <Field label="Harga Reseller *">
              <input
                type="number"
                value={form.reseller_price}
                onChange={e => set('reseller_price', e.target.value)}
                placeholder="0"
                style={{ ...monoInputStyle, borderColor: errors.reseller_price ? 'var(--red)' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = errors.reseller_price ? 'var(--red)' : 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.reseller_price ? 'var(--red)' : 'var(--border)'}
              />
              {errors.reseller_price && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--red)' }}>{errors.reseller_price}</p>}
            </Field>
            <Field label="Harga Online" hint="Opsional">
              <input
                type="number"
                value={form.online_price}
                onChange={e => set('online_price', e.target.value)}
                placeholder="0"
                style={monoInputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>
          </div>
        </div>

        {/* Stok minimum */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <Field label="Stok Minimum" hint="Peringatan stok tipis jika stok ≤ nilai ini">
            <input
              type="number"
              value={form.min_stock}
              onChange={e => set('min_stock', e.target.value)}
              min={0}
              style={{ ...monoInputStyle, maxWidth: 120 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </Field>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 18px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontSize: 13,
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: loading ? 'var(--accent-dim)' : 'var(--accent)',
              border: 'none', borderRadius: 8, padding: '9px 18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Save size={13} />
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </div>
    </div>
  )
}
