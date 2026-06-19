import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'
import api from '../api/axios'

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : '—'

const CARBON_LABELS = { twill: 'Twill', forged: 'Forged', plain: 'Plain' }

export default function Import() {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [excludedRows, setExcludedRows] = useState(new Set())
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileInputRef = useRef()

  const reset = () => {
    setFile(null)
    setPreview(null)
    setExcludedRows(new Set())
    setError('')
    setResult(null)
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['.xlsx', '.xls']
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase()
    if (!validTypes.includes(ext)) {
      setError('Format file harus .xlsx atau .xls')
      return
    }
    setFile(selectedFile)
    setError('')
    setResult(null)
    handleUploadPreview(selectedFile)
  }

  const handleUploadPreview = async (selectedFile) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      const res = await api.post('/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreview(res.data.data)
      setExcludedRows(new Set())
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses file. Pastikan format sesuai template.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    handleFileSelect(droppedFile)
  }

  const toggleExclude = (rowNumber) => {
    setExcludedRows(prev => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })
  }

  const validRowsToImport = preview
    ? preview.rows.filter(r => r.is_valid && !excludedRows.has(r.row_number))
    : []

  const handleConfirm = async () => {
    if (validRowsToImport.length === 0) return
    setConfirming(true)
    setError('')
    try {
      const products = validRowsToImport.map(r => ({
        sku: r.sku,
        name: r.name,
        carbon_type: r.carbon_type,
        vespa_compatibility: r.vespa_compatibility,
        modal_price: r.modal_price,
        reseller_price: r.reseller_price,
        online_price: r.online_price,
      }))
      const res = await api.post('/import/confirm', { products })
      setResult(res.data)
      setPreview(null)
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengimport data')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Import Produk
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Upload file Excel untuk menambahkan produk secara massal
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div style={{
          background: 'var(--green-bg)', border: '1px solid rgba(90,158,90,0.25)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <CheckCircle2 size={20} color="var(--green)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
              {result.message}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {result.data.imported} berhasil
              {result.data.failed > 0 && ` · ${result.data.failed} gagal`}
            </div>
          </div>
          <button onClick={reset} style={{
            background: 'var(--accent)', border: 'none', borderRadius: 6,
            padding: '6px 14px', cursor: 'pointer', color: '#0d0d0d',
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
          }}>
            Import Lagi
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.25)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: 'var(--red)', fontFamily: 'Inter, sans-serif',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* Upload dropzone — only shown when no preview yet */}
      {!preview && !result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-active)'}`,
            borderRadius: 12, padding: '48px 24px', textAlign: 'center',
            cursor: 'pointer', background: dragOver ? 'var(--accent-bg)' : 'var(--bg-surface)',
            transition: 'all 0.15s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={e => handleFileSelect(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: 'var(--accent-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Upload size={24} color="var(--accent)" />
          </div>
          {uploading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
              Memproses file...
            </div>
          ) : (
            <>
              <div style={{ color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500, marginBottom: 6 }}>
                Drag & drop file Excel di sini, atau klik untuk pilih file
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                Format: .xlsx atau .xls
              </div>
            </>
          )}
        </div>
      )}

      {/* Template hint */}
      {!preview && !result && (
        <div style={{
          marginTop: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FileSpreadsheet size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-primary)' }}>
              Format kolom Excel yang diharapkan
            </span>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 6, overflowX: 'auto',
          }}>
            SKU | Nama Produk | Carbon Type | Kompatibilitas Vespa | Harga Modal | Harga Reseller | Harga Online
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
            Carbon Type: twill / forged / plain · Kompatibilitas dipisah koma (cth: "Sprint, LX")
          </p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div>
          {/* Summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Total baris: </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{preview.total_rows}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Valid: </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{preview.valid_rows}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>Invalid: </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>{preview.invalid_rows}</span>
              </div>
            </div>
            <button onClick={reset} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer', color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif', fontSize: 12,
            }}>
              <X size={13} /> Batal
            </button>
          </div>

          {/* Preview table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                  {['', 'Baris', 'SKU', 'Nama', 'Carbon Type', 'Kompatibilitas', 'Modal', 'Reseller', 'Online', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '9px 12px', textAlign: 'left',
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => {
                  const excluded = excludedRows.has(row.row_number)
                  return (
                    <tr key={row.row_number}
                      style={{
                        borderBottom: i < preview.rows.length - 1 ? '1px solid var(--border)' : 'none',
                        opacity: !row.is_valid ? 0.5 : excluded ? 0.4 : 1,
                        background: !row.is_valid ? 'var(--red-bg)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '9px 12px' }}>
                        {row.is_valid && (
                          <input
                            type="checkbox"
                            checked={!excluded}
                            onChange={() => toggleExclude(row.row_number)}
                            style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
                          />
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                        #{row.row_number}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {row.sku}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-primary)' }}>
                        {row.name || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {CARBON_LABELS[row.carbon_type] || row.carbon_type || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {Array.isArray(row.vespa_compatibility) ? row.vespa_compatibility.join(', ') : '—'}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {fmt(row.modal_price)}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {fmt(row.reseller_price)}
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {fmt(row.online_price)}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {row.is_valid ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)', fontFamily: 'Inter, sans-serif' }}>
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        ) : (
                          <span title={row.errors?.join(', ')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', fontFamily: 'Inter, sans-serif', cursor: 'help' }}>
                            <XCircle size={12} /> {row.errors?.[0] || 'Invalid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Confirm action */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--accent-bg)', border: '1px solid rgba(200,169,110,0.2)',
            borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{validRowsToImport.length}</span> produk akan diimport
            </div>
            <button
              onClick={handleConfirm}
              disabled={confirming || validRowsToImport.length === 0}
              style={{
                background: confirming || validRowsToImport.length === 0 ? 'var(--accent-dim)' : 'var(--accent)',
                border: 'none', borderRadius: 8, padding: '9px 20px',
                cursor: confirming || validRowsToImport.length === 0 ? 'not-allowed' : 'pointer',
                color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              }}
            >
              {confirming ? 'Mengimport...' : `Konfirmasi Import (${validRowsToImport.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}