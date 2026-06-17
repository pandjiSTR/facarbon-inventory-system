import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, user: userData } = res.data.data
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login gagal' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token')

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
