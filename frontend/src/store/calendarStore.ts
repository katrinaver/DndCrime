import { create } from 'zustand'
import * as calendarApi from '../api/calendar'
import type { CalendarEvent, CampaignCalendarEventInput } from '../modules/calendar/types'

interface CalendarState {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  fetchEvents: () => Promise<void>
  addCampaignEvent: (input: CampaignCalendarEventInput) => Promise<CalendarEvent | undefined>
  reset: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null })
    try {
      const events = await calendarApi.fetchCalendarEvents()
      set({ events, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить календарь',
      })
    }
  },

  addCampaignEvent: async (input) => {
    try {
      const event = await calendarApi.createCalendarEvent(input)
      set((state) => ({ events: [...state.events, event] }))
      return event
    } catch {
      return undefined
    }
  },

  reset: () => set({ events: [], loading: false, error: null }),
}))
