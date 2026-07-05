import { useOutletContext } from 'react-router-dom'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'
import { getCampaignChat } from '../modules/campaigns/campaignRoomData'

export function CampaignChatPage() {
  const { campaign } = useOutletContext<CampaignRoomContext>()
  const messages = getCampaignChat(campaign.id)

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
      <h3 className="text-lg font-semibold text-white">Чат кампании</h3>
      <p className="mt-1 text-sm text-dnd-muted">Общение группы между сессиями</p>

      {messages.length === 0 ? (
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
                <span className="text-xs text-dnd-muted">{message.time}</span>
              </div>
              <p className="mt-1 text-sm text-gray-200">{message.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Написать сообщение..."
          disabled
          className="min-w-0 flex-1 rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white opacity-60 outline-none"
        />
        <button
          type="button"
          disabled
          className="shrink-0 rounded-lg bg-dnd-purple/30 px-4 py-2.5 text-sm text-dnd-muted"
        >
          Отправить
        </button>
      </div>
      <p className="mt-2 text-xs text-dnd-muted">Чат пока заглушка — скоро подключим к бэкенду</p>
    </div>
  )
}
