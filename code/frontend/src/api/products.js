import { apiRequest } from './client'

// params: { categoryId, search, active, page, size, sort }
export const listProducts = (params) => apiRequest('/products', { params })
export const getProduct = (id) => apiRequest(`/products/${id}`)
export const createProduct = (data) => apiRequest('/products', { method: 'POST', body: data })
export const updateProduct = (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: data })
export const setProductStatus = (id, active) => apiRequest(`/products/${id}/status`, { method: 'PATCH', body: { active } })
