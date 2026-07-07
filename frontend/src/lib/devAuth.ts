import type { AuthSession, AuthUser } from './authTypes'

export const DEV_AUTH_STORAGE_KEY = 'dndcrime-dev-auth'
export const DEV_USER_EMAIL = 'dev@dndcrime.local'

export function isDevAuthStubEnabled(): boolean {
  if (import.meta.env.VITE_DEV_AUTH_STUB !== 'true') return false
  if (import.meta.env.DEV) return true
  return import.meta.env.VITE_DEV_AUTH_ALLOW_BUILD === 'true'
}

export function isDevAuthActive(): boolean {
  if (!isDevAuthStubEnabled()) return false
  return localStorage.getItem(DEV_AUTH_STORAGE_KEY) === 'true'
}

export function setDevAuthActive(active: boolean) {
  if (active) {
    localStorage.setItem(DEV_AUTH_STORAGE_KEY, 'true')
  } else {
    localStorage.removeItem(DEV_AUTH_STORAGE_KEY)
  }
}

// Совпадает с backend/internal/auth/dev.go (DevAuthUserID) и seed-данными store.
export const DEV_USER_ID = 'user-demo'

export function createDevUser(): AuthUser {
  return {
    id: DEV_USER_ID,
    email: DEV_USER_EMAIL,
    name: 'Dev Adventurer',
  }
}

export function createDevSession(user: AuthUser): AuthSession {
  return {
    access_token: 'dev-stub-token',
    token_type: 'bearer',
    user,
  }
}
