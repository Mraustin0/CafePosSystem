import { apiRequest } from './client'

// All reports need { from, to } as ISO date (yyyy-mm-dd)
export const salesSummary = (from, to) => apiRequest('/reports/sales-summary', { params: { from, to } })
export const topProducts = (from, to, limit) => apiRequest('/reports/top-products', { params: { from, to, limit } })
export const salesByCashier = (from, to) => apiRequest('/reports/sales-by-cashier', { params: { from, to } })
export const salesByPaymentMethod = (from, to) => apiRequest('/reports/sales-by-payment-method', { params: { from, to } })

// GET /reports/sales-by-day → [{ date, netSales }] — zero-sales days included for stable chart axes.
export const salesByDay = (from, to) => apiRequest('/reports/sales-by-day', { params: { from, to } })

// GET /reports/sales-by-category → [{ categoryId, categoryName, revenue, percent }] ordered by revenue DESC.
export const salesByCategory = (from, to) => apiRequest('/reports/sales-by-category', { params: { from, to } })
