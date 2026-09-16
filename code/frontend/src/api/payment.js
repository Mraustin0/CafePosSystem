import { apiRequest } from './client'

// body: { method: 'CASH'|'QR_CODE'|'CARD', amount } — amount = cash received (CASH only)
export const payOrder = (orderId, body) => apiRequest(`/orders/${orderId}/payment`, { method: 'POST', body })
export const getPayment = (orderId) => apiRequest(`/orders/${orderId}/payment`)
