import { useState } from 'react'
import { Check } from 'lucide-react'
import api from '../../api/axios'
import Dropzone from './Dropzone'
import { ResultBanner, ErrorBanner } from './ResultBanner'

const CATEGORIES = [
  { value: 'pembelian_stok', label: 'Pembelian Stok' },
  { value: 'produksi',       label: 'Produksi' },
  { value: 'penjualan',      label: 'Penjualan' },
  { value: 'operasional',    label: 'Operasional' },
  { value: 'lain_lain',      label: 'Lain-lain' },
]

const inputStyle = {
  width: '100%', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 6,
  padding: '6px 8px', color: 'var(--text-primary)',
  fontSize: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none',
}

export default function ImportFinanceTab() {
  const [rows, setRows] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const reset = () => {
    setRows(null)
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
      const res = await api.post('/import/finance/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setRows(res.data.data.rows || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses file')
      setRows(null)
    } finally {
      setUploading(false)
    }
  }

  const updateRow = (rowNumber, key, val) => {
    setRows(prev => prev.map(r => r.row_number === rowNumber ? { ...r, [key]: val } : r))
  }

  const handleConfirm = async () => {
    if (!rows || rows.length === 0) return
    setConfirming(true)
    setError('')
    try {
      const records = rows.map(r => ({
        date: r.date,
        description: r.description,
        type: r.type,
        category: r.category,
        amount: Number(r.amount),
      }))
      const res = await api.post('/import/finance/confirm', { records })
      setResult(res.data)
      setRows(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengimport data keuangan')
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
          <Dropzone onFileSelect={handleFileSelect} uploading={uploading} label="Upload file Catatan Keuangan" />
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
              Tanggal | Keterangan | Debit | Kredit
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
              Baris tanpa tanggal akan otomatis memakai tanggal dari baris terisi terakhir di atasnya
            </p>
          </div>
        </>
      )}

      {rows && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rows.length}</span> baris ditemukan — periksa & sesuaikan sebelum import
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
                  {['#', 'Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Nominal'].map(h => (
                    <th key={h} style={{
                      padding: '9px 12px', textAlign: 'left',
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.row_number} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '7px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.row_number}
                    </td>
                    <td style={{ padding: '7px 12px', minWidth: 120 }}>
                      <input type="date" value={row.date} onChange={e => updateRow(row.row_number, 'date', e.target.value)}
                        style={{ ...inputStyle, colorScheme: 'dark' }} />
                    </td>
                    <td style={{ padding: '7px 12px', minWidth: 200 }}>
                      <input value={row.description} onChange={e => updateRow(row.row_number, 'description', e.target.value)}
                        style={inputStyle} />
                    </td>
                    <td style={{ padding: '7px 12px', minWidth: 110 }}>
                      <select value={row.type} onChange={e => updateRow(row.row_number, 'type', e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer', color: row.type === 'kredit' ? 'var(--green)' : 'var(--red)' }}>
                        <option value="kredit" style={{ background: 'var(--bg-elevated)' }}>Kredit</option>
                        <option value="debit" style={{ background: 'var(--bg-elevated)' }}>Debit</option>
                      </select>
                    </td>
                    <td style={{ padding: '7px 12px', minWidth: 150 }}>
                      <select value={row.category} onChange={e => updateRow(row.row_number, 'category', e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--bg-elevated)' }}>{c.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '7px 12px', minWidth: 130 }}>
                      <input type="number" value={row.amount} onChange={e => updateRow(row.row_number, 'amount', e.target.value)}
                        style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{rows.length}</span> catatan akan diimport
            </div>
            <button onClick={handleConfirm} disabled={confirming}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: confirming ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none', borderRadius: 8, padding: '9px 20px',
                cursor: confirming ? 'not-allowed' : 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
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
