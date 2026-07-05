import { Link } from 'react-router-dom'
import { useCalendar } from './CalendarContext'
import {
  formatMonthYear,
  getCalendarDays,
  isSameDay,
  toDateKey,
  WEEKDAYS_SHORT,
} from './utils'

interface CalendarProps {
  variant?: 'mini' | 'large'
  showHeaderLink?: boolean
  className?: string
}

export function Calendar({
  variant = 'large',
  showHeaderLink = false,
  className = '',
}: CalendarProps) {
  const {
    selectedDate,
    viewDate,
    eventsByDate,
    setSelectedDate,
    setViewDate,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  } = useCalendar()

  const today = new Date()
  const days = getCalendarDays(viewDate)
  const isMini = variant === 'mini'

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  return (
    <div
      className={`rounded-xl border border-dnd-border bg-dnd-card ${isMini ? 'p-3' : 'p-6'} ${className}`}
    >
      <div className={`flex items-center justify-between ${isMini ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-white ${isMini ? 'text-sm' : 'text-lg'}`}>
            {formatMonthYear(viewDate)}
          </h3>
          {showHeaderLink && (
            <Link
              to="/calendar"
              className="text-xs text-dnd-gold hover:text-dnd-gold-hover"
            >
              открыть
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isMini && (
            <button
              type="button"
              onClick={goToToday}
              className="mr-1 rounded-md px-2 py-1 text-xs text-dnd-muted transition hover:bg-dnd-border/50 hover:text-white"
            >
              Сегодня
            </button>
          )}
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Предыдущий месяц"
            className="rounded-md p-1 text-dnd-muted transition hover:bg-dnd-border/50 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Следующий месяц"
            className="rounded-md p-1 text-dnd-muted transition hover:bg-dnd-border/50 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS_SHORT.map((day) => (
          <div
            key={day}
            className={`text-center font-medium text-dnd-muted ${isMini ? 'py-1 text-[10px]' : 'py-2 text-xs'}`}
          >
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />
          }

          const dateKey = toDateKey(date)
          const dayEvents = eventsByDate.get(dateKey) ?? []
          const isToday = isSameDay(date, today)
          const isSelected = isSameDay(date, selectedDate)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleSelectDate(date)}
              className={[
                'relative flex flex-col items-center justify-start rounded-lg transition',
                isMini ? 'min-h-[2rem] py-0.5 text-xs' : 'min-h-[4.5rem] p-1.5 text-sm',
                isSelected
                  ? 'bg-dnd-purple text-white'
                  : isToday
                    ? 'bg-dnd-gold/15 text-dnd-gold ring-1 ring-dnd-gold/40'
                    : 'text-gray-300 hover:bg-dnd-border/40',
              ].join(' ')}
            >
              <span className="font-medium">{date.getDate()}</span>

              {dayEvents.length > 0 && (
                <div className={`mt-auto flex flex-wrap justify-center gap-0.5 ${isMini ? 'mt-0.5' : 'mt-1 w-full'}`}>
                  {isMini ? (
                    <span
                      className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-dnd-purple'}`}
                    />
                  ) : (
                    dayEvents.slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        className={`truncate rounded px-1 text-[10px] leading-tight ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-dnd-purple/20 text-dnd-purple-hover'
                        }`}
                      >
                        {event.title}
                      </span>
                    ))
                  )}
                  {!isMini && dayEvents.length > 2 && (
                    <span className="text-[10px] text-dnd-muted">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
