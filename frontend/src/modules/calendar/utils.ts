import type { CalendarEvent } from './types'

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Monday-first: 0 = Monday, 6 = Sunday */
export function getMondayFirstOffset(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function getCalendarDays(viewDate: Date): (Date | null)[] {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingEmpty = getMondayFirstOffset(new Date(year, month, 1))

  const days: (Date | null)[] = Array.from({ length: leadingEmpty }, () => null)

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  while (days.length % 7 !== 0) {
    days.push(null)
  }

  return days
}

export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const list = map.get(event.date) ?? []
    list.push(event)
    map.set(event.date, list)
  }
  return map
}
