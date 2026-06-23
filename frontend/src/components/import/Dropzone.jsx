import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

export default function Dropzone({ onFileSelect, uploading, label = 'Upload file Excel' }) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) onFileSelect(droppedFile)
  }

  return (
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
        onChange={e => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]) }}
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
            {label}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
            Drag & drop atau klik untuk pilih file (.xlsx / .xls)
          </div>
        </>
      )}
    </div>
  )
}
