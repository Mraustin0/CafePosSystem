import { apiRequest } from './client'

// body: { method: 'CASH'|'QR_CODE'|'CARD', amountReceived }
// CASH: amountReceived >= total (change = amountReceived − total)
// QR_CODE / CARD: amountReceived must equal total exactly
export const payOrder = (orderId, body) => apiRequest(`/orders/${orderId}/payment`, { method: 'POST', body })
export const getPayment = (orderId) => apiRequest(`/orders/${orderId}/payment`)
