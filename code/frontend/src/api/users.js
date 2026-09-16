import { apiRequest } from './client'

// /me — logged-in user
export const getMe = () => apiRequest('/users/me')
export const updateMyProfile = (data) => apiRequest('/users/me/profile', { method: 'PUT', body: data })
export const changeMyPassword = (data) => apiRequest('/users/me/password', { method: 'PUT', body: data })

// Admin — params: { role, active, page, size, sort }
export const listUsers = (params) => apiRequest('/users', { params })
export const getUser = (id) => apiRequest(`/users/${id}`)
export const createUser = (data) => apiRequest('/users', { method: 'POST', body: data })
export const updateUser = (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: data })
export const setUserStatus = (id, active) => apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { active } })
