import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { isRichTextEmpty, RichTextContent, RichTextEditor } from '../../components/rich-text'
import { formatNotificationTime } from '../../modules/notifications/utils'
import type { ChatMessage } from '../../api/chat'

interface CampaignChatMessageProps {
  message: ChatMessage
  isOwn: boolean
  authorLabel: string
  onUpdate: (messageId: string, text: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
}

export function CampaignChatMessage({
  message,
  isOwn,
  authorLabel,
  onUpdate,
  onDelete,
}: CampaignChatMessageProps) {
  const [editing, setEditing] = useState(false)
  const [editHtml, setEditHtml] = useState(message.text)
  const [editorKey, setEditorKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function startEditing() {
    setEditHtml(message.text)
    setEditorKey((key) => key + 1)
    setEditing(true)
    setActionError(null)
  }

  function cancelEditing() {
    setEditing(false)
    setEditHtml(message.text)
    setActionError(null)
  }

  async function handleSave() {
    if (isRichTextEmpty(editHtml)) return

    setSaving(true)
    setActionError(null)
    try {
      await onUpdate(message.id, editHtml)
      setEditing(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Удалить сообщение?')) return

    setDeleting(true)
    setActionError(null)
    try {
      await onDelete(message.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось удалить')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <li className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'group max-w-[85%] rounded-2xl border px-4 py-3 sm:max-w-[72%]',
          isOwn
            ? 'border-dnd-purple/40 bg-dnd-purple/15'
            : 'border-dnd-border bg-dnd-dark/60',
        ].join(' ')}
      >
        <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
          <span
            className={[
              'text-sm font-medium',
              isOwn ? 'text-dnd-purple-hover' : 'text-dnd-gold',
            ].join(' ')}
          >
            {authorLabel}
          </span>
          <span className="text-[11px] text-dnd-muted">
            {formatNotificationTime(message.createdAt)}
            {message.updatedAt && (
              <span className="ml-1 text-dnd-muted/80">· изменено</span>
            )}
          </span>

          {isOwn && !editing && (
            <span className="ml-auto flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={startEditing}
                disabled={deleting}
                className="rounded px-1.5 py-0.5 text-[11px] text-dnd-muted transition hover:bg-dnd-border/60 hover:text-white"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded px-1.5 py-0.5 text-[11px] text-red-400/80 transition hover:bg-red-500/10 hover:text-red-300"
              >
                {deleting ? '…' : 'Удалить'}
              </button>
            </span>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <RichTextEditor
              key={editorKey}
              compact
              initialContent={message.text}
              placeholder="Редактировать сообщение…"
              disabled={saving}
              onChange={setEditHtml}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-xs text-dnd-muted transition hover:text-white"
              >
                Отмена
              </button>
              <Button
                type="button"
                className="!w-auto px-4"
                disabled={saving || isRichTextEmpty(editHtml)}
                loading={saving}
                onClick={() => void handleSave()}
              >
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <RichTextContent
            content={message.text}
            className={isOwn ? 'text-gray-100' : 'text-gray-200'}
          />
        )}

        {actionError && (
          <p className="mt-2 text-xs text-red-400">{actionError}</p>
        )}
      </div>
    </li>
  )
}
