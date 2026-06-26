import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/useToast'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const roles = ['admin', 'staff']

export default function Users() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', is_active: true })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', role: 'staff', is_active: true })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      if (editing) {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.put(`/users/${editing.id}`, payload)
        toast('User berhasil diperbarui', 'success')
      } else {
        await api.post('/users', form)
        toast('User berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      setLoading(true)
      api.get('/users')
        .then(res => setUsers(res.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        toast(err.response?.data?.message || 'Gagal menyimpan user', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast('User berhasil dihapus', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menghapus user', 'error')
    } finally {
      setDeleting(null)
      setConfirmDelete({ isOpen: false, id: null })
    }
  }

  const rolesLabel = { admin: 'Admin', staff: 'Staff' }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Pengguna
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {users.length} user terdaftar
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            padding: '9px 16px', cursor: 'pointer',
            color: '#0d0d0d', fontFamily: 'Inter, sans-serif',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={14} />
          Tambah User
        </button>
      </div>

      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Memuat...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            Belum ada user
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                {['Nama', 'Email', 'Role', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
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
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: u.is_active ? 1 : 0.5,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>{u.email}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      padding: '2px 8px', borderRadius: 4,
                      background: u.role === 'admin' ? 'var(--accent-bg)' : 'rgba(255,255,255,0.04)',
                      color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {rolesLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {u.is_active
                      ? <span style={{ color: 'var(--green)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Aktif</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} />Nonaktif</span>
                    }
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => openEdit(u)}
                        title="Edit"
                        style={{
                          background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)',
                          borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', color: 'var(--accent)',
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: u.id })}
                        disabled={deleting === u.id}
                        title="Hapus"
                        style={{
                          background: 'var(--red-bg)', border: '1px solid rgba(224,90,90,0.15)',
                          borderRadius: 6, padding: '5px 7px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', color: 'var(--red)',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--bg-surface)', borderRadius: 12,
            padding: 24, width: 420, maxWidth: '90vw',
            border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {editing ? 'Edit User' : 'Tambah User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>Nama</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  }}
                />
                {errors.name && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>{errors.name[0]}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  }}
                />
                {errors.email && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>{errors.email[0]}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                  Password {editing && '(kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  }}
                />
                {errors.password && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>{errors.password[0]}</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>Role</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {roles.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8, border: '2px solid',
                        cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500,
                        background: form.role === r ? 'var(--accent-bg)' : 'transparent',
                        borderColor: form.role === r ? 'var(--accent)' : 'var(--border)',
                        color: form.role === r ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {rolesLabel[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <label htmlFor="is_active" style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                  User aktif
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontSize: 13,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: submitting ? 'var(--accent-dim)' : 'var(--accent)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    color: '#0d0d0d', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {submitting ? 'Menyimpan...' : (editing ? 'Simpan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus User"
        message="Apakah Anda yakin ingin menghapus user ini?"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        loading={deleting === confirmDelete.id}
      />
    </div>
  )
}
