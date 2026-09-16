import { apiRequest } from './client'

// params: { status, from, to, cashierId, page, size, sort }
// from/to = ISO date (yyyy-mm-dd)
export const listOrders = (params) => apiRequest('/orders', { params })
export const getOrder = (id) => apiRequest(`/orders/${id}`)

// items = [{ productId, quantity, addOnIds: [] }]
export const createOrder = (items) => apiRequest('/orders', { method: 'POST', body: { items } })
export const replaceOrderItems = (id, items) => apiRequest(`/orders/${id}/items`, { method: 'PUT', body: { items } })

// discount: { discountType: 'NONE'|'PERCENT'|'AMOUNT', discountValue }
export const applyDiscount = (id, discount) => apiRequest(`/orders/${id}/discount`, { method: 'PUT', body: discount })
export const cancelOrder = (id) => apiRequest(`/orders/${id}/cancel`, { method: 'POST' })
