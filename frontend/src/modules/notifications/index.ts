/**
 * Микрофронтенд уведомлений — самодостаточный модуль.
 *
 * Публичный API:
 * - NotificationProvider — контекст и загрузка данных
 * - NotificationBell — виджет для шапки (колокольчик + панель)
 * - useNotifications — доступ к состоянию из других частей приложения
 */

export { NotificationProvider, useNotifications } from './NotificationContext'
export { NotificationBell } from './NotificationBell'
export { NotificationPanel } from './NotificationPanel'
export { NotificationItem } from './NotificationItem'

export type { Notification, NotificationListResponse, NotificationType } from './types'

export {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notificationsApi'

export {
  getNotificationLink,
  getNotificationTypeLabel,
  formatNotificationTime,
} from './utils'
