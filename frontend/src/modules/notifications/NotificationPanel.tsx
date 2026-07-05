import { useEffect, useRef } from 'react'
import { NotificationItem } from './NotificationItem'
import { useNotifications } from './NotificationContext'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export function NotificationPanel({ open, onClose, anchorRef }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { items, unreadCount, loading, error, markRead, markAllRead, refresh } =
    useNotifications()

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return
      }
      onClose()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Уведомления"
      className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-dnd-border bg-dnd-card shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-dnd-border bg-dnd-dark/50">
        <div>
          <h2 className="text-sm font-semibold text-white">Уведомления</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-dnd-muted mt-0.5">
              {unreadCount} непрочитанных
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-xs text-dnd-muted hover:text-white px-2 py-1 rounded transition-colors"
            title="Обновить"
          >
            ↻
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs text-dnd-gold hover:text-dnd-gold-hover px-2 py-1 rounded transition-colors"
            >
              Прочитать все
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="px-4 py-2 text-xs text-dnd-gold bg-dnd-gold/10 border-b border-dnd-border">
          {error}
        </p>
      )}

      <div className="max-h-80 overflow-y-auto">
        {loading && items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-dnd-muted">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-dnd-muted">
            Нет уведомлений
          </p>
        ) : (
          items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => void markRead(id)}
              onNavigate={onClose}
            />
          ))
        )}
      </div>
    </div>
  )
}
