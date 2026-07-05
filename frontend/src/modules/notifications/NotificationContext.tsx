import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotificationStore } from '../../store/notificationStore'
import type { Notification } from './types'

interface NotificationContextValue {
  items: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const POLL_INTERVAL_MS = 60_000

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const items = useNotificationStore((s) => s.items)
  const loading = useNotificationStore((s) => s.loading)
  const error = useNotificationStore((s) => s.error)
  const refresh = useNotificationStore((s) => s.refresh)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  useEffect(() => {
    if (authLoading || !user) return

    const timer = window.setInterval(() => {
      void refresh()
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [user, authLoading, refresh])

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      error,
      refresh,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, loading, error, refresh, markRead, markAllRead],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
