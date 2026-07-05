import { create } from 'zustand'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../modules/notifications/notificationsApi'
import type { Notification } from '../modules/notifications/types'
import { countUnread, sortNotifications } from '../modules/notifications/utils'

interface NotificationState {
  items: Notification[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchNotifications()
      set({ items: sortNotifications(data.items), loading: false })
    } catch (err) {
      set({
        items: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить уведомления',
      })
    }
  },

  markRead: async (id) => {
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
    try {
      await markNotificationRead(id)
    } catch {
      void get().refresh()
    }
  },

  markAllRead: async () => {
    set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) }))
    try {
      await markAllNotificationsRead()
    } catch {
      void get().refresh()
    }
  },

  reset: () => set({ items: [], loading: false, error: null }),
}))

export function useUnreadCount() {
  return useNotificationStore((state) => countUnread(state.items))
}
