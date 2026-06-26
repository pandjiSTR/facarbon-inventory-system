import { useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import api from '../../api/axios'
import Dropzone from './Dropzone'
import { ResultBanner, ErrorBanner } from './ResultBanner'

const CATEGORIES = [
  { value: 'pembelian_stok', label: 'Pembelian Stok' },
  { value: 'produksi',       label: 'Produksi' },
]

const inputStyle = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 6,
  padding: '6px 8px', color: 'var(--text-primary)',
  fontSize: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

export default function ImportStockInTab() {
  const [rows, setRows] = useState(null)
  const [availableProducts, setAvailableProducts] = useState([])
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const reset = () => {
    setRows(null)
    setAvailableProducts([])
    setError('')
    setResult(null)
  }

  const handleFileSelect = async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!['.xlsx', '.xls'].includes(ext)) {
      setError('Format file harus .xlsx atau .xls')
      return
    }
    setUploading(true)
    setError('')
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/import/stock-in/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const data = res.data.data
      setRows((data.rows || []).map(r => ({
        ...r,
        product_id: r.matched_product_id ?? '',
        modal_price: r.matched_modal_price ?? '',
        category: 'pembelian_stok',
      })))
      setAvailableProducts(data.available_products || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses file')
      setRows(null)
    } finally {
      setUploading(false)
    }
  }

  const updateRow = (rowNumber, key, val) => {
    setRows(prev => prev.map(r => {
      if (r.row_number !== rowNumber) return r
      const updated = { ...r, [key]: val }
      // Auto-fill modal_price saat pilih produk manual
      if (key === 'product_id') {
        const p = availableProducts.find(p => p.id === Number(val))
        if (p) updated.modal_price = p.modal_price
      }
      return updated
    }))
  }

  const unmatchedCount = rows?.filter(r => !r.product_id).length || 0

  const handleConfirm = async () => {
    if (!rows || unmatchedCount > 0) return
    setConfirming(true)
    setError('')
    try {
      const records = rows.map(r => ({
        product_id: Number(r.product_id),
        quantity: Number(r.quantity),
        modal_price: Number(r.modal_price),
        date: r.date,
        category: r.category,
      }))
      const res = await api.post('/import/stock-in/confirm', { records })
      setResult(res.data)
      setRows(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengimport barang masuk')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div>
      <ResultBanner result={result} onReset={reset} />
      <ErrorBanner error={error} />

      {!rows && !result && (
        <>
          <Dropzone onFileSelect={handleFileSelect} uploading={uploading} label="Upload file Barang Masuk" />
          <div style={{
            marginTop: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Format kolom Excel yang diharapkan
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 6,
            }}>
              Tanggal | ITEM | MATERIAL | CARBON TYPE | QTY
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
              Sistem akan mencocokkan nama item ke produk yang ada. Baris yang tidak cocok wajib dipilih manual sebelum import.
            </p>
          </div>
        </>
      )}

      {rows && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rows.length}</span> baris ditemukan
              {unmatchedCount > 0 && (
                <span style={{ color: 'var(--red)', marginLeft: 8 }}>
                  · {unmatchedCount} belum dipilih produknya
                </span>
              )}
            </div>
            <button onClick={reset} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer', color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif', fontSize: 12,
            }}>
              Batal
            </button>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  {['#', 'Tanggal', 'Item Excel', 'Produk', 'Qty', 'Harga Modal', 'Kategori'].map(h => (
                    <th key={h} style={{
                      padding: '9px 12px', textAlign: 'left',
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const unmatched = !row.product_id
                  return (
                    <tr key={row.row_number} style={{
                      borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                      background: unmatched ? 'rgba(224,168,90,0.06)' : 'transparent',
                    }}>
                      <td style={{ padding: '7px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {row.row_number}
                      </td>
                      <td style={{ padding: '7px 12px', minWidth: 110 }}>
                        <input type="date" value={row.date} onChange={e => updateRow(row.row_number, 'date', e.target.value)}
                          style={{ ...inputStyle, colorScheme: 'dark' }} />
                      </td>
                      <td style={{ padding: '7px 12px', fontSize: 12, color: 'var(--text-secondary)', minWidth: 160 }}>
                        {row.item_name}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.carbon_type} · {row.material}</div>
                      </td>
                      <td style={{ padding: '7px 12px', minWidth: 220 }}>
                        <select value={row.product_id} onChange={e => updateRow(row.row_number, 'product_id', e.target.value)}
                          style={{
                            ...inputStyle, cursor: 'pointer',
                            borderColor: unmatched ? '#e0a85a' : 'var(--border)',
                          }}>
                          <option value="" style={{ background: 'var(--bg-elevated)' }}>— Pilih produk —</option>
                          {availableProducts.map(p => (
                            <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
                              {p.sku} — {p.name} ({p.carbon_type})
                            </option>
                          ))}
                        </select>
                        {unmatched && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, color: '#e0a85a' }}>
                            <AlertTriangle size={10} /> Wajib pilih manual
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '7px 12px', minWidth: 70 }}>
                        <input type="number" min={1} value={row.quantity} onChange={e => updateRow(row.row_number, 'quantity', e.target.value)}
                          style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                      </td>
                      <td style={{ padding: '7px 12px', minWidth: 120 }}>
                        <input type="number" min={0} value={row.modal_price} onChange={e => updateRow(row.row_number, 'modal_price', e.target.value)}
                          style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                      </td>
                      <td style={{ padding: '7px 12px', minWidth: 130 }}>
                        <select value={row.category} onChange={e => updateRow(row.row_number, 'category', e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: unmatchedCount > 0 ? 'var(--red-bg)' : 'var(--accent-bg)',
            border: `1px solid ${unmatchedCount > 0 ? 'rgba(224,90,90,0.2)' : 'rgba(200,169,110,0.2)'}`,
            borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              {unmatchedCount > 0 ? (
                <span style={{ color: 'var(--red)' }}>
                  Lengkapi {unmatchedCount} baris yang belum punya produk sebelum import
                </span>
              ) : (
                <><span style={{ fontWeight: 600, color: 'var(--accent)' }}>{rows.length}</span> barang masuk akan dicatat</>
              )}
            </div>
            <button onClick={handleConfirm} disabled={confirming || unmatchedCount > 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: (confirming || unmatchedCount > 0) ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none', borderRadius: 8, padding: '9px 20px',
                cursor: (confirming || unmatchedCount > 0) ? 'not-allowed' : 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                opacity: unmatchedCount > 0 ? 0.5 : 1,
              }}>
              <Check size={14} />
              {confirming ? 'Mengimport...' : `Konfirmasi Import (${rows.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
