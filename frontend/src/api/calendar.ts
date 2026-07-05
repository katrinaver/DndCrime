import { apiFetch } from '../lib/apiClient'
import type { CalendarEvent, CampaignCalendarEventInput } from '../modules/calendar/types'

export function fetchCalendarEvents() {
  return apiFetch<CalendarEvent[]>('/api/calendar/events')
}

export function createCalendarEvent(input: CampaignCalendarEventInput) {
  return apiFetch<CalendarEvent>('/api/calendar/events', {
    method: 'POST',
    body: JSON.stringify({
      date: input.date,
      time: input.time,
      title: input.title,
      campaignId: input.campaignId,
      campaign: input.campaignName,
      place: input.place,
    }),
  })
}
