import type { Notification } from '../modules/notifications/types'

const now = new Date().toISOString()
const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

export const stubNotifications: Notification[] = [
  {
    id: 'stub-1',
    userId: 'user-demo',
    type: 'campaign_chat_message',
    title: 'Новое сообщение в «Проклятие Страда»',
    body: 'Напоминаю: сессия в субботу в 19:00',
    read: false,
    visibleAt: hourAgo,
    createdAt: hourAgo,
    campaignId: '1',
    campaignName: 'Проклятие Страда',
    chatMessageId: 'c1',
    authorName: 'Алексей',
  },
  {
    id: 'stub-2',
    userId: 'user-demo',
    type: 'news_post',
    title: 'Новость: Проклятие Страда',
    body: 'Следующая сессия «Проклятие Страда» — перенос на воскресенье.',
    read: false,
    visibleAt: hourAgo,
    createdAt: hourAgo,
    authorName: 'Алексей',
  },
  {
    id: 'stub-3',
    userId: 'user-demo',
    type: 'calendar_reminder',
    title: 'Завтра сессия: Проклятие Страда',
    body: 'Кампания «Проклятие Страда» — 2026-07-05',
    read: true,
    visibleAt: now,
    createdAt: now,
    campaignId: '1',
    campaignName: 'Проклятие Страда',
    calendarEventId: 'ev1',
    eventDate: '2026-07-05',
  },
]
