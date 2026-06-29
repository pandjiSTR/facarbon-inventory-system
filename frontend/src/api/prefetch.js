import api from './axios'
import { queryKeys } from './queryKeys'

export function prefetchDashboard(queryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => api.get('/dashboard').then(r => r.data?.data || r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchProducts(queryClient, page = 1) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.list(page),
    queryFn: () =>
      api.get('/products', { params: { page, per_page: 25 } }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchProductList(queryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.products.all(),
    queryFn: () => api.get('/products?per_page=100').then(r => r.data?.data || r.data || []),
    staleTime: 1000 * 60 * 5,
  })
}

export function prefetchStockIn(queryClient, page = 1) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.stockIn.list(page),
    queryFn: () => api.get('/stock-in', { params: { page } }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchStockOut(queryClient, page = 1) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.stockOut.list(page),
    queryFn: () => api.get('/stock-out', { params: { page } }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchInvoices(queryClient, page = 1) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.invoices.list(page),
    queryFn: () => api.get('/invoices', { params: { page } }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchFinances(queryClient, page = 1, type = '', category = '') {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.finances.list(page, type, category),
    queryFn: () => api.get('/finances', { params: { page, type, category } }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
  })
}

export function prefetchTransactions(queryClient) {
  const opts = { staleTime: 1000 * 60 * 5 }
  queryClient.prefetchQuery({
    queryKey: queryKeys.stockIn.large(),
    queryFn: () => api.get('/stock-in?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
  queryClient.prefetchQuery({
    queryKey: queryKeys.stockOut.large(),
    queryFn: () => api.get('/stock-out?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
  queryClient.prefetchQuery({
    queryKey: queryKeys.finances.large(),
    queryFn: () => api.get('/finances?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
}

export function prefetchReports(queryClient) {
  const opts = { staleTime: 1000 * 60 * 5 }
  queryClient.prefetchQuery({
    queryKey: queryKeys.products.large(),
    queryFn: () => api.get('/products?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
  queryClient.prefetchQuery({
    queryKey: queryKeys.stockIn.large(),
    queryFn: () => api.get('/stock-in?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
  queryClient.prefetchQuery({
    queryKey: queryKeys.stockOut.large(),
    queryFn: () => api.get('/stock-out?per_page=5000').then(r => r.data?.data || r.data || []),
    ...opts,
  })
}

const routePrefetchMap = {
  '/dashboard': prefetchDashboard,
  '/products': (qc) => prefetchProducts(qc, 1),
  '/stock-in': (qc) => {
    prefetchProductList(qc)
    prefetchStockIn(qc, 1)
  },
  '/stock-out': (qc) => {
    prefetchProductList(qc)
    prefetchStockOut(qc, 1)
  },
  '/finances': (qc) => prefetchFinances(qc, 1),
  '/invoices': (qc) => {
    prefetchProductList(qc)
    prefetchInvoices(qc, 1)
  },
  '/transactions': prefetchTransactions,
  '/reports': prefetchReports,
}

export function prefetchRoute(queryClient, route) {
  const fn = routePrefetchMap[route]
  if (fn) fn(queryClient)
}
