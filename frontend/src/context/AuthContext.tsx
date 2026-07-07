import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredAuth,
  getStoredAccessToken,
  storeAuth,
} from '../lib/authStorage'
import type { AuthSession, AuthUser } from '../lib/authTypes'
import {
  createDevSession,
  createDevUser,
  isDevAuthActive,
  isDevAuthStubEnabled,
  setDevAuthActive,
} from '../lib/devAuth'

interface ProfileResponse {
  id: string
  email: string
  profile?: {
    name?: string
    avatarUrl?: string
  }
}

interface GoogleAuthResponse {
  accessToken: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  isDevAuth: boolean
  signInWithGoogleCredential: (credential: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  enableDevAuth: () => void
  disableDevAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function createSession(token: string, user: AuthUser): AuthSession {
  return {
    access_token: token,
    token_type: 'bearer',
    user,
  }
}

function userFromMeResponse(data: ProfileResponse): AuthUser {
  return {
    id: data.id,
    email: data.email,
    name: data.profile?.name,
    avatarUrl: data.profile?.avatarUrl,
  }
}

function applyDevAuth(
  setUser: (user: AuthUser | null) => void,
  setSession: (session: AuthSession | null) => void,
  setIsDevAuth: (value: boolean) => void,
) {
  const devUser = createDevUser()
  setUser(devUser)
  setSession(createDevSession(devUser))
  setIsDevAuth(true)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDevAuth, setIsDevAuth] = useState(false)

  const enableDevAuth = useCallback(() => {
    if (!isDevAuthStubEnabled()) return
    clearStoredAuth()
    setDevAuthActive(true)
    applyDevAuth(setUser, setSession, setIsDevAuth)
    setLoading(false)
  }, [])

  const disableDevAuth = useCallback(async () => {
    setDevAuthActive(false)
    setIsDevAuth(false)
    setUser(null)
    setSession(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (isDevAuthStubEnabled() && isDevAuthActive()) {
        applyDevAuth(setUser, setSession, setIsDevAuth)
        setLoading(false)
        return
      }

      const token = getStoredAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          clearStoredAuth()
          if (!cancelled) {
            setUser(null)
            setSession(null)
          }
          return
        }

        const data = (await res.json()) as ProfileResponse
        const authUser = userFromMeResponse(data)
        storeAuth(token, authUser)
        if (!cancelled) {
          setUser(authUser)
          setSession(createSession(token, authUser))
          setIsDevAuth(false)
        }
      } catch {
        clearStoredAuth()
        if (!cancelled) {
          setUser(null)
          setSession(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const signInWithGoogleCredential = useCallback(async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      if (!res.ok) {
        const text = await res.text()
        return { error: text || 'Не удалось войти через Google' }
      }

      const data = (await res.json()) as GoogleAuthResponse
      const authUser = data.user
      clearStoredAuth()
      setDevAuthActive(false)
      storeAuth(data.accessToken, authUser)
      setUser(authUser)
      setSession(createSession(data.accessToken, authUser))
      setIsDevAuth(false)
      return { error: null }
    } catch {
      return { error: 'Не удалось войти через Google' }
    }
  }, [])

  const signOut = useCallback(async () => {
    setDevAuthActive(false)
    clearStoredAuth()
    setIsDevAuth(false)
    setUser(null)
    setSession(null)
    window.google?.accounts.id.disableAutoSelect()
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isDevAuth,
      signInWithGoogleCredential,
      signOut,
      enableDevAuth,
      disableDevAuth,
    }),
    [user, session, loading, isDevAuth, signInWithGoogleCredential, signOut, enableDevAuth, disableDevAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
