import { Calendar } from './Calendar'

export function MiniCalendarWidget() {
  return (
    <div className="sticky top-6">
      <Calendar variant="mini" showHeaderLink />
    </div>
  )
}
