import type { AuthUser } from './authTypes'

export const AUTH_TOKEN_STORAGE_KEY = 'dndcrime-auth-token'
export const AUTH_USER_STORAGE_KEY = 'dndcrime-auth-user'

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    clearStoredAuth()
    return null
  }
}

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
