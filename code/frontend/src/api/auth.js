// Example of a MOCK API module: backend login is not built yet (Phase 2).
// When it is, delete the mock branch — the page code does not change.
import { apiRequest, ApiError } from './client'

const USE_MOCK = true

const MOCK_USERS = {
  admin: { id: 1, username: 'admin', role: 'ADMIN', active: true, fullName: 'Cafe Owner', phone: '0800000001', email: 'admin@cafepos.local' },
  cashier1: { id: 2, username: 'cashier1', role: 'CASHIER', active: true, fullName: 'Cashier One', phone: '0800000002', email: 'cashier1@cafepos.local' },
}

/** @returns {Promise<{accessToken: string, tokenType: string, expiresIn: number, user: object}>} */
export async function login(username, password) {
  if (!USE_MOCK) {
    return apiRequest('/auth/login', { method: 'POST', body: { username, password } })
  }
  const user = MOCK_USERS[username]
  if (!user || password !== 'cafe1234') {
    throw new ApiError(401, 'Invalid username or password')
  }
  return { accessToken: 'mock-token', tokenType: 'Bearer', expiresIn: 3600, user }
}
