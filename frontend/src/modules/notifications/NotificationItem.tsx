import { useNavigate } from 'react-router-dom'
import type { Notification } from './types'
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationLink,
  getNotificationTypeLabel,
} from './utils'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onNavigate?: () => void
}

export function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: NotificationItemProps) {
  const navigate = useNavigate()
  const link = getNotificationLink(notification)

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id)
    }
    if (link) {
      navigate(link)
      onNavigate?.()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-dnd-border/50 transition-colors hover:bg-dnd-border/30 ${
        notification.read ? 'opacity-70' : 'bg-dnd-purple/5'
      }`}
    >
      <div className="flex gap-3">
        <span className="text-lg shrink-0 mt-0.5" aria-hidden>
          {getNotificationIcon(notification.type)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm leading-snug ${
                notification.read ? 'text-dnd-muted' : 'text-white font-medium'
              }`}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span
                className="shrink-0 w-2 h-2 rounded-full bg-dnd-gold mt-1.5"
                aria-label="Непрочитано"
              />
            )}
          </div>
          <p className="text-xs text-dnd-muted mt-1 line-clamp-2">{notification.body}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-dnd-muted/80">
            <span>{getNotificationTypeLabel(notification.type)}</span>
            {notification.authorName && (
              <>
                <span aria-hidden>·</span>
                <span>{notification.authorName}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <time dateTime={notification.createdAt}>
              {formatNotificationTime(notification.createdAt)}
            </time>
          </div>
        </div>
      </div>
    </button>
  )
}
