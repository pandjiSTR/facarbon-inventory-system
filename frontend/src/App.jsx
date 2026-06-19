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
import Finances from './pages/Finances'
import Invoices from './pages/Invoices'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Import from './pages/Import'
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
              <Route path="finances"          element={<Finances />} />
              <Route path="invoices"          element={<Invoices />} />
              <Route path="transactions"      element={<Transactions />} />
              <Route path="reports"           element={<Reports />} />
              <Route path="import"            element={<Import />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
