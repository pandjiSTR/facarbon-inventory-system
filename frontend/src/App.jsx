import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// React Query client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10,           // Cache retained for 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,      // Don't refetch on window focus
      retry: 1,                         // Retry failed requests once
    },
  },
})

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductForm = lazy(() => import('./pages/ProductForm'))
const StockIn = lazy(() => import('./pages/StockIn'))
const StockOut = lazy(() => import('./pages/StockOut'))
const Finances = lazy(() => import('./pages/Finances'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Reports = lazy(() => import('./pages/Reports'))
const Import = lazy(() => import('./pages/Import'))
const Users = lazy(() => import('./pages/Users'))

function PageLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'var(--text-muted)', fontSize: 13,
      fontFamily: 'Inter, sans-serif',
    }}>
      Memuat...
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
            <ErrorBoundary>
            <Suspense fallback={<PageLoading />}>
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
              <Route path="users"            element={<Users />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </Suspense>
            </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
