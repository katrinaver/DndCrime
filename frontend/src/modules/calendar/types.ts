export interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  title: string
  campaignId?: string
  campaign?: string
  place?: string
}

export interface CampaignCalendarEventInput {
  campaignId: string
  campaignName: string
  date: string
  time?: string
  place?: string
  title: string
}
