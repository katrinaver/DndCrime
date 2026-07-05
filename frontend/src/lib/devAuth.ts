import type { Session, User } from '@supabase/supabase-js'

export const DEV_AUTH_STORAGE_KEY = 'dndcrime-dev-auth'
export const DEV_USER_EMAIL = 'dev@dndcrime.local'

export function isDevAuthStubEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_STUB === 'true'
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

export function createDevUser(): User {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: {},
    user_metadata: { name: 'Dev Adventurer' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: DEV_USER_EMAIL,
  } as User
}

export function createDevSession(user: User): Session {
  return {
    access_token: 'dev-stub-token',
    refresh_token: 'dev-stub-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  }
}
