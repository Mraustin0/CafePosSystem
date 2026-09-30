import { apiRequest } from './client'

// params: { active } — omit to get all
export const listAddOns = (params) => apiRequest('/add-ons', { params })
export const getAddOn = (id) => apiRequest(`/add-ons/${id}`)
export const createAddOn = (data) => apiRequest('/add-ons', { method: 'POST', body: data })
export const updateAddOn = (id, data) => apiRequest(`/add-ons/${id}`, { method: 'PUT', body: data })
export const setAddOnStatus = (id, active) => apiRequest(`/add-ons/${id}/status`, { method: 'PATCH', body: { active } })
