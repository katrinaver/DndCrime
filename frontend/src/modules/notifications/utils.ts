import type { Notification, NotificationType } from './types'

const TYPE_LABELS: Record<NotificationType, string> = {
  campaign_chat_message: 'Чат кампании',
  news_post: 'Новости',
  calendar_reminder: 'Календарь',
}

const TYPE_ICONS: Record<NotificationType, string> = {
  campaign_chat_message: '💬',
  news_post: '📢',
  calendar_reminder: '📅',
}

export function getNotificationTypeLabel(type: NotificationType): string {
  return TYPE_LABELS[type]
}

export function getNotificationIcon(type: NotificationType): string {
  return TYPE_ICONS[type]
}

export function getNotificationLink(notification: Notification): string | null {
  switch (notification.type) {
    case 'campaign_chat_message':
      return notification.campaignId ? `/campaigns/${notification.campaignId}/chat` : null
    case 'news_post':
      return '/news'
    case 'calendar_reminder':
      if (notification.campaignId) {
        return `/campaigns/${notification.campaignId}/menu`
      }
      return '/calendar'
    default:
      return null
  }
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'только что'
  if (diffMin < 60) return `${diffMin} мин. назад`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} ч. назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sortNotifications(items: Notification[]): Notification[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function countUnread(items: Notification[]): number {
  return items.filter((n) => !n.read).length
}
