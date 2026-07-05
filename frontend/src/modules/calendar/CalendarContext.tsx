import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCampaigns } from '../campaigns/CampaignContext'
import { stubCalendarEvents } from './calendarEvents'
import { groupEventsByDate } from './utils'
import type { CalendarEvent, CampaignCalendarEventInput } from './types'

interface CalendarContextValue {
  selectedDate: Date
  viewDate: Date
  events: CalendarEvent[]
  eventsByDate: Map<string, CalendarEvent[]>
  setSelectedDate: (date: Date) => void
  setViewDate: (date: Date) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  addCampaignEvent: (input: CampaignCalendarEventInput) => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { userCampaignIds } = useCampaigns()
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [viewDate, setViewDate] = useState(() => new Date())
  const [dynamicEvents, setDynamicEvents] = useState<CalendarEvent[]>([])

  const allEvents = useMemo(
    () => [...stubCalendarEvents, ...dynamicEvents],
    [dynamicEvents],
  )

  const events = useMemo(
    () =>
      allEvents.filter(
        (event) => !event.campaignId || userCampaignIds.includes(event.campaignId),
      ),
    [allEvents, userCampaignIds],
  )

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])

  const goToPrevMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }, [])

  const addCampaignEvent = useCallback((input: CampaignCalendarEventInput) => {
    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      date: input.date,
      time: input.time,
      title: input.title,
      campaignId: input.campaignId,
      campaign: input.campaignName,
      place: input.place,
    }
    setDynamicEvents((prev) => [...prev, event])
  }, [])

  const value = useMemo(
    () => ({
      selectedDate,
      viewDate,
      events,
      eventsByDate,
      setSelectedDate,
      setViewDate,
      goToPrevMonth,
      goToNextMonth,
      goToToday,
      addCampaignEvent,
    }),
    [
      selectedDate,
      viewDate,
      events,
      eventsByDate,
      goToPrevMonth,
      goToNextMonth,
      goToToday,
      addCampaignEvent,
    ],
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider')
  }
  return context
}
