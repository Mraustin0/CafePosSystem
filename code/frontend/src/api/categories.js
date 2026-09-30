// Example of a finished API module (backend is implemented). Copy this shape for other resources.
import { apiRequest } from './client'

export const getCategories = () => apiRequest('/categories')

export const getCategory = (id) => apiRequest(`/categories/${id}`)

export const createCategory = (data) => apiRequest('/categories', { method: 'POST', body: data })

export const updateCategory = (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: data })

export const deleteCategory = (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' })
