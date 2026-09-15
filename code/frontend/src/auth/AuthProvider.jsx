import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { TOKEN_KEY } from '../api/client'
import { AuthContext } from './useAuth'

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(TOKEN_KEY))
    return saved && saved.expiresAt > Date.now() ? saved : null
  } catch {
    return null
  }
}

// ponytail: token lives in localStorage (readable by any script on the page); move to an HttpOnly cookie if XSS risk matters.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setSession(null)
  }, [])

  const login = useCallback(async (username, password) => {
    // A stale token (expired, or signed by a key from before a server restart) would be sent with the
    // login request and rejected before it reaches /auth/login.
    localStorage.removeItem(TOKEN_KEY)
    const res = await authApi.login(username, password)
    const next = { accessToken: res.accessToken, user: res.user, expiresAt: Date.now() + res.expiresIn * 1000 }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(next))
    setSession(next)
    return res.user
  }, [])

  // apiRequest fires this on any 401 — the token is expired or invalid.
  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const value = useMemo(
    () => ({ user: session?.user ?? null, isAuthenticated: !!session, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
