import api from '../api/axios'

export default async function exportCSV(url, filename) {
  const res = await api.get(url, { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
