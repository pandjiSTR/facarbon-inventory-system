export const queryKeys = {
  dashboard: () => ['dashboard'],
  products: {
    all: () => ['products'],
    list: (page = 1, search = '', filterType = '', filterStock = '') =>
      ['products', page, search, filterType, filterStock],
    large: (perPage = 5000) => ['products', perPage],
    detail: (id) => ['product', id],
  },
  stockIn: {
    list: (page = 1) => ['stock-in', page],
    large: (perPage = 5000) => ['stock-in', perPage],
  },
  stockOut: {
    list: (page = 1) => ['stock-out', page],
    large: (perPage = 5000) => ['stock-out', perPage],
  },
  invoices: {
    list: (page = 1) => ['invoices', page],
  },
  finances: {
    list: (page = 1, type = '', category = '') =>
      ['finances', page, type, category],
    large: (perPage = 5000) => ['finances', perPage],
  },
}
