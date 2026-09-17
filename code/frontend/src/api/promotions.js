import { apiRequest } from './client'

// params: { active } — omit to list all
export const listPromotions = (params) => apiRequest('/promotions', { params })
export const getPromotion = (id) => apiRequest(`/promotions/${id}`)

// body: { code, name, discountType: 'PERCENT'|'FIXED_AMOUNT', discountValue, minOrderAmount?, active? }
export const createPromotion = (data) => apiRequest('/promotions', { method: 'POST', body: data })
export const updatePromotion = (id, data) => apiRequest(`/promotions/${id}`, { method: 'PUT', body: data })
export const setPromotionStatus = (id, active) => apiRequest(`/promotions/${id}/status`, { method: 'PATCH', body: { active } })
export const deletePromotion = (id) => apiRequest(`/promotions/${id}`, { method: 'DELETE' })
