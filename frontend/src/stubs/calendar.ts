import type { CalendarEvent } from '../modules/calendar/types'

export const stubCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    date: '2026-07-05',
    title: 'Сессия #12',
    campaignId: '1',
    campaign: 'Проклятие Страда',
  },
  {
    id: '2',
    date: '2026-07-12',
    time: '19:00',
    title: 'Сессия #8',
    campaignId: '2',
    campaign: 'Таверна у Красного Дракона',
  },
  {
    id: '3',
    date: '2026-07-12',
    title: 'Планирование кампании',
    campaignId: '3',
    campaign: 'Поход в Подгорье',
  },
  {
    id: '4',
    date: '2026-07-19',
    title: 'Сессия #13',
    campaignId: '1',
    campaign: 'Проклятие Страда',
  },
  {
    id: '5',
    date: '2026-07-26',
    title: 'Сессия #9',
    campaignId: '2',
    campaign: 'Таверна у Красного Дракона',
  },
]
