import { Calendar, useCalendar } from '../modules/calendar'
import { formatFullDate, toDateKey } from '../modules/calendar/utils'

export function CalendarPage() {
  const { selectedDate, eventsByDate } = useCalendar()
  const selectedKey = toDateKey(selectedDate)
  const dayEvents = eventsByDate.get(selectedKey) ?? []

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Календарь</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Расписание сессий и событий по кампаниям
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Calendar variant="large" />

        <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h3 className="text-sm font-medium text-dnd-muted">Выбранная дата</h3>
          <p className="mt-1 text-lg font-semibold capitalize text-white">
            {formatFullDate(selectedDate)}
          </p>

          <div className="mt-6">
            {dayEvents.length === 0 ? (
              <p className="text-sm text-dnd-muted">Нет событий на этот день</p>
            ) : (
              <ul className="space-y-3">
                {dayEvents.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-lg border border-dnd-border bg-dnd-dark/50 p-3"
                  >
                    <p className="font-medium text-white">{event.title}</p>
                    {event.time && (
                      <p className="mt-0.5 text-xs text-dnd-gold">{event.time}</p>
                    )}
                    {event.campaign && (
                      <p className="mt-1 text-xs text-dnd-muted">{event.campaign}</p>
                    )}
                    {event.place && (
                      <p className="mt-0.5 text-xs text-dnd-muted">{event.place}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
