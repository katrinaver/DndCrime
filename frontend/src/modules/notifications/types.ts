export type NotificationType =
  | 'campaign_chat_message'
  | 'news_post'
  | 'calendar_reminder'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  visibleAt: string
  createdAt: string
  campaignId?: string
  campaignName?: string
  chatMessageId?: string
  newsPostId?: string
  calendarEventId?: string
  eventDate?: string
  eventTime?: string
  authorName?: string
}

export interface NotificationListResponse {
  items: Notification[]
  unreadCount: number
}
