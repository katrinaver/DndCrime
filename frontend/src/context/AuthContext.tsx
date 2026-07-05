import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  createDevSession,
  createDevUser,
  isDevAuthActive,
  isDevAuthStubEnabled,
  setDevAuthActive,
} from '../lib/devAuth'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  isDevAuth: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  enableDevAuth: () => void
  disableDevAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applyDevAuth(
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  setIsDevAuth: (value: boolean) => void,
) {
  const devUser = createDevUser()
  setUser(devUser)
  setSession(createDevSession(devUser))
  setIsDevAuth(true)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDevAuth, setIsDevAuth] = useState(false)

  const enableDevAuth = useCallback(() => {
    if (!isDevAuthStubEnabled()) return
    setDevAuthActive(true)
    applyDevAuth(setUser, setSession, setIsDevAuth)
    setLoading(false)
  }, [])

  const disableDevAuth = useCallback(async () => {
    setDevAuthActive(false)
    setIsDevAuth(false)
    setUser(null)
    setSession(null)

    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setUser(session?.user ?? null)
  }, [])

  useEffect(() => {
    if (isDevAuthStubEnabled() && isDevAuthActive()) {
      applyDevAuth(setUser, setSession, setIsDevAuth)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isDevAuthActive()) return
      setSession(session)
      setUser(session?.user ?? null)
      setIsDevAuth(false)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (isDevAuthActive()) {
      await disableDevAuth()
      return
    }
    await supabase.auth.signOut()
  }, [disableDevAuth])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    return { error: error?.message ?? null }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isDevAuth,
      signIn,
      signUp,
      signOut,
      resetPassword,
      enableDevAuth,
      disableDevAuth,
    }),
    [user, session, loading, isDevAuth, signIn, signUp, signOut, resetPassword, enableDevAuth, disableDevAuth],
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
