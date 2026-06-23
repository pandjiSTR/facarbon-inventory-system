export default function Placeholder({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
          Halaman dalam pengembangan
        </div>
        <h1 style={{ color: 'var(--text-secondary)', fontSize: 22, fontWeight: 600 }}>{title}</h1>
      </div>
    </div>
  )
}
