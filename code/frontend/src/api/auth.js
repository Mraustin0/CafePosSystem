import { apiRequest } from './client'

// Backend not ready for your resource yet? Return fake data with the same shape as the Swagger response,
// e.g. `export const getOrders = async () => ({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })`,
// then swap in apiRequest when the endpoint is merged — pages don't change.

/** @returns {Promise<{accessToken: string, tokenType: string, expiresIn: number, user: object}>} */
export const login = (username, password) =>
  apiRequest('/auth/login', { method: 'POST', body: { username, password } })
