// Single place that talks HTTP. Every api/*.js file calls apiRequest — pages never call fetch directly.

const BASE_URL = '/api/v1'
export const TOKEN_KEY = 'cafepos.auth'

/** Thrown for any non-2xx response. Mirrors the backend ApiErrorResponse. */
export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function authHeader() {
  try {
    const saved = JSON.parse(localStorage.getItem(TOKEN_KEY))
    return saved?.accessToken ? { Authorization: `Bearer ${saved.accessToken}` } : {}
  } catch {
    return {}
  }
}

/**
 * @param {string} path    e.g. '/categories' or `/orders/${id}`
 * @param {object} options { method, body, params } — params become the query string, empty values are skipped
 */
export async function apiRequest(path, { method = 'GET', body, params } = {}) {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    : ''

  let response
  try {
    response = await fetch(BASE_URL + path + query, {
      method,
      headers: { ...authHeader(), ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot connect to server')
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? response.statusText, data?.fieldErrors ?? {})
  }
  return data
}
