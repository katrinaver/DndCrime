import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { isRichTextEmpty, RichTextEditor } from '../../components/rich-text'
import { useAuth } from '../../context/AuthContext'
import { CampaignChatMessage } from './CampaignChatMessage'
import { useChatStore } from '../../store/chatStore'
import { useCharacterStore } from '../../store/characterStore'

interface CampaignChatPanelProps {
  campaignId: string
  campaignName: string
  masterId: string
}

export function CampaignChatPanel({ campaignId, campaignName, masterId }: CampaignChatPanelProps) {
  const { user } = useAuth()
  const character = useCharacterStore((s) => s.getCharacterByCampaignId(campaignId))
  const fetchCharacters = useCharacterStore((s) => s.fetchCharacters)
  const messages = useChatStore((s) => s.getCampaignMessages(campaignId))
  const loading = useChatStore((s) => s.loadingByCampaign[campaignId])
  const fetchCampaignChat = useChatStore((s) => s.fetchCampaignChat)
  const sendCampaignMessage = useChatStore((s) => s.sendCampaignMessage)
  const updateCampaignMessage = useChatStore((s) => s.updateCampaignMessage)
  const deleteCampaignMessage = useChatStore((s) => s.deleteCampaignMessage)

  const [messageHtml, setMessageHtml] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserLabel =
    user?.id === masterId ? 'Мастер' : (character?.name ?? user?.email?.split('@')[0] ?? 'Вы')

  useEffect(() => {
    void fetchCharacters()
  }, [fetchCharacters])

  useEffect(() => {
    void fetchCampaignChat(campaignId)
  }, [campaignId, fetchCampaignChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend() {
    if (isRichTextEmpty(messageHtml)) return

    setSending(true)
    setError(null)
    try {
      await sendCampaignMessage(campaignId, messageHtml)
      setMessageHtml('')
      setEditorKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[520px] flex-col rounded-xl border border-dnd-border bg-dnd-card">
      <div className="border-b border-dnd-border px-5 py-4">
        <h3 className="text-lg font-semibold text-white">Чат кампании</h3>
        <p className="mt-1 text-sm text-dnd-muted">
          {campaignName} · общение группы между сессиями
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading && messages.length === 0 ? (
          <p className="text-sm text-dnd-muted">Загрузка сообщений…</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-dnd-border/80 bg-dnd-dark/30 px-6 text-center">
            <div>
              <p className="text-sm text-dnd-muted">Сообщений пока нет</p>
              <p className="mt-1 text-xs text-dnd-muted/80">
                Напишите первое — можно прикрепить картинку или ссылку
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => {
              const isOwn = message.authorId === user?.id
              return (
                <CampaignChatMessage
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  authorLabel={message.author}
                  onUpdate={(messageId, text) => updateCampaignMessage(campaignId, messageId, text)}
                  onDelete={(messageId) => deleteCampaignMessage(campaignId, messageId)}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      <div className="border-t border-dnd-border px-4 py-4 sm:px-5">
        <RichTextEditor
          key={editorKey}
          compact
          submitOnEnter
          placeholder="Написать сообщение…"
          disabled={sending}
          onChange={setMessageHtml}
          onSubmit={() => void handleSend()}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-dnd-muted">Отправляете как {currentUserLabel}</p>
          <Button
            type="button"
            className="!w-auto px-5"
            disabled={sending || isRichTextEmpty(messageHtml)}
            loading={sending}
            onClick={() => void handleSend()}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  )
}
