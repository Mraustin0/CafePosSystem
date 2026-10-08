// Example of a finished API module (backend is implemented). Copy this shape for other resources.
import { apiRequest } from './client'

export const getCategories = () => apiRequest('/categories')

export const getCategory = (id) => apiRequest(`/categories/${id}`)

export const createCategory = (data) => apiRequest('/categories', { method: 'POST', body: data })

export const updateCategory = (id, data) => apiRequest(`/categories/${id}`, { method: 'PUT', body: data })

export const deleteCategory = (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' })

// POS sidebar nav keys are hard-coded (coffee/tea/snack) in UI, but the backend category name string
// may vary in case or extra whitespace. Match by substring so backend-side renames don't break the UI.
export function navKeyFor(categoryName) {
  if (!categoryName) return 'coffee'
  const n = String(categoryName).trim().toLowerCase()
  if (n.includes('coffee') || n.includes('espresso')) return 'coffee'
  if (n.includes('tea')) return 'tea'
  if (n.includes('bakery') || n.includes('snack') || n.includes('ขนม')) return 'snack'
  return 'coffee'
}

// Find the backend category record for a given nav key by matching navKeyFor on each loaded row.
// Returns null if no loaded category maps to the nav key.
export function categoryForNav(categories, navKey) {
  if (!Array.isArray(categories) || !navKey) return null
  return categories.find((c) => navKeyFor(c?.name) === navKey) ?? null
}
