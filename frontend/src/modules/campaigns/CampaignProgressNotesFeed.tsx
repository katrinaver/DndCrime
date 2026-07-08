import { RichTextContent } from '../../components/rich-text'
import type { CampaignProgress, CampaignProgressNote } from './types'

function formatNoteDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface CampaignProgressNotesFeedProps {
  progress: CampaignProgress
  canManage?: boolean
  onDeleteNote?: (noteId: string) => void
  deletingNoteId?: string | null
}

export function CampaignProgressNotesFeed({
  progress,
  canManage = false,
  onDeleteNote,
  deletingNoteId,
}: CampaignProgressNotesFeedProps) {
  const notes = progress.notes ?? []

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="text-lg font-semibold text-white">Прогресс кампании</h3>
        {progress.currentChapter ? (
          <p className="mt-1 text-sm text-dnd-gold">{progress.currentChapter}</p>
        ) : (
          <p className="mt-1 text-sm text-dnd-muted">Текущая глава ещё не указана</p>
        )}
      </section>

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center text-sm text-dnd-muted">
          {canManage
            ? 'Опубликуйте первую заметку о ходе кампании'
            : 'Мастер ещё не опубликовал заметки о прогрессе'}
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map((note: CampaignProgressNote) => (
            <li
              key={note.id}
              className="rounded-xl border border-dnd-border bg-dnd-card p-5 shadow-lg shadow-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{note.authorName}</p>
                  <p className="text-xs text-dnd-muted">{formatNoteDate(note.createdAt)}</p>
                </div>
                {canManage && onDeleteNote && (
                  <button
                    type="button"
                    disabled={deletingNoteId === note.id}
                    onClick={() => onDeleteNote(note.id)}
                    className="text-xs text-dnd-muted transition hover:text-red-400 disabled:opacity-50"
                  >
                    {deletingNoteId === note.id ? 'Удаление…' : 'Удалить'}
                  </button>
                )}
              </div>
              <RichTextContent content={note.content} className="mt-3" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
