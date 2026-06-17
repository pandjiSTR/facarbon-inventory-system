import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import StockIn from './pages/StockIn'
import StockOut from './pages/StockOut'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"         element={<Dashboard />} />
              <Route path="products"          element={<Products />} />
              <Route path="products/create"   element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="stock-in"          element={<StockIn />} />
              <Route path="stock-out"         element={<StockOut />} />
              <Route path="finances"          element={<Placeholder title="Keuangan" />} />
              <Route path="invoices"          element={<Placeholder title="Faktur" />} />
              <Route path="transactions"      element={<Placeholder title="Riwayat Transaksi" />} />
              <Route path="reports"           element={<Placeholder title="Laporan" />} />
              <Route path="import"            element={<Placeholder title="Import Data" />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
