import { useRef, useState } from 'react'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from './NotificationContext'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { unreadCount, loading } = useNotifications()

  const toggle = () => setOpen((prev) => !prev)

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unreadCount > 0
            ? `Уведомления: ${unreadCount} непрочитанных`
            : 'Уведомления'
        }
        className="relative p-2 rounded-lg text-dnd-muted hover:text-white hover:bg-dnd-border/50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-dnd-gold text-[10px] font-bold text-dnd-dark leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {loading && unreadCount === 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-dnd-muted animate-pulse" />
        )}
      </button>

      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
      />
    </div>
  )
}
