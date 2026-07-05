import { apiFetch } from '../../lib/apiClient'

export { ApiError } from '../../lib/apiClient'

export async function fetchNotifications() {
  return apiFetch<{ items: import('./types').Notification[]; unreadCount: number }>(
    '/api/notifications',
  )
}

export async function markNotificationRead(id: string) {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllNotificationsRead() {
  return apiFetch<{ marked: number }>('/api/notifications/read-all', { method: 'POST' })
}
