import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCampaigns } from '../campaigns/CampaignContext'
import { useCalendarStore } from '../../store/calendarStore'
import { groupEventsByDate } from './utils'
import type { CalendarEvent, CampaignCalendarEventInput } from './types'

interface CalendarContextValue {
  selectedDate: Date
  viewDate: Date
  events: CalendarEvent[]
  eventsByDate: Map<string, CalendarEvent[]>
  loading: boolean
  error: string | null
  setSelectedDate: (date: Date) => void
  setViewDate: (date: Date) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  addCampaignEvent: (input: CampaignCalendarEventInput) => Promise<CalendarEvent | undefined>
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { userCampaignIds } = useCampaigns()
  const allEvents = useCalendarStore((s) => s.events)
  const loading = useCalendarStore((s) => s.loading)
  const error = useCalendarStore((s) => s.error)
  const addCampaignEventStore = useCalendarStore((s) => s.addCampaignEvent)

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [viewDate, setViewDate] = useState(() => new Date())

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

  const addCampaignEvent = useCallback(
    (input: CampaignCalendarEventInput) => addCampaignEventStore(input),
    [addCampaignEventStore],
  )

  const value = useMemo(
    () => ({
      selectedDate,
      viewDate,
      events,
      eventsByDate,
      loading,
      error,
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
      loading,
      error,
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
