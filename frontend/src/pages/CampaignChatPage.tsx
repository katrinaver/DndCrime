import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useChatStore } from '../store/chatStore'
import { formatNotificationTime } from '../modules/notifications/utils'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'

export function CampaignChatPage() {
  const { campaign } = useOutletContext<CampaignRoomContext>()
  const messages = useChatStore((s) => s.getCampaignMessages(campaign.id))
  const loading = useChatStore((s) => s.loadingByCampaign[campaign.id])
  const fetchCampaignChat = useChatStore((s) => s.fetchCampaignChat)
  const sendCampaignMessage = useChatStore((s) => s.sendCampaignMessage)

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchCampaignChat(campaign.id)
  }, [campaign.id, fetchCampaignChat])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return

    setSending(true)
    setError(null)
    try {
      await sendCampaignMessage(campaign.id, trimmed)
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
      <h3 className="text-lg font-semibold text-white">Чат кампании</h3>
      <p className="mt-1 text-sm text-dnd-muted">Общение группы между сессиями</p>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      {loading && messages.length === 0 ? (
        <p className="mt-6 text-sm text-dnd-muted">Загрузка…</p>
      ) : messages.length === 0 ? (
        <p className="mt-6 text-sm text-dnd-muted">Сообщений пока нет</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-lg border border-dnd-border bg-dnd-dark/50 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-dnd-gold">{message.author}</span>
                <span className="text-xs text-dnd-muted">
                  {formatNotificationTime(message.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-200">{message.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
          placeholder="Написать сообщение..."
          className="min-w-0 flex-1 rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || !text.trim()}
          className="shrink-0 rounded-lg bg-dnd-purple px-4 py-2.5 text-sm text-white transition hover:bg-dnd-purple-hover disabled:opacity-50"
        >
          {sending ? '…' : 'Отправить'}
        </button>
      </div>
    </div>
  )
}
