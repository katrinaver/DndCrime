import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { isRichTextEmpty, RichTextEditor } from '../components/rich-text'
import { CampaignProgressNotesFeed } from '../modules/campaigns/CampaignProgressNotesFeed'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'
import type { CampaignProgress } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

const emptyProgress = (campaignId: string): CampaignProgress => ({
  campaignId,
  currentChapter: '',
  notes: [],
})

export function CampaignMasterProgressPage() {
  const { campaign } = useOutletContext<CampaignMasterContext>()
  const fetchCampaignProgress = useCampaignStore((s) => s.fetchCampaignProgress)
  const saveCampaignProgress = useCampaignStore((s) => s.saveCampaignProgress)
  const createCampaignProgressNote = useCampaignStore((s) => s.createCampaignProgressNote)
  const deleteCampaignProgressNote = useCampaignStore((s) => s.deleteCampaignProgressNote)
  const cached = useCampaignStore((s) => s.getCampaignProgress(campaign.id))

  const [progress, setProgress] = useState<CampaignProgress>(() => cached ?? emptyProgress(campaign.id))
  const [currentChapter, setCurrentChapter] = useState(progress.currentChapter)
  const [noteHtml, setNoteHtml] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [loading, setLoading] = useState(!cached)
  const [savingChapter, setSavingChapter] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chapterSaved, setChapterSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchCampaignProgress(campaign.id)
        if (!cancelled) {
          setProgress(data)
          setCurrentChapter(data.currentChapter)
        }
      } catch {
        if (!cancelled) {
          const fallback = emptyProgress(campaign.id)
          setProgress(fallback)
          setCurrentChapter('')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [campaign.id, fetchCampaignProgress])

  async function handleSaveChapter(e: React.FormEvent) {
    e.preventDefault()
    setSavingChapter(true)
    setError(null)
    setChapterSaved(false)
    try {
      const saved = await saveCampaignProgress(campaign.id, { currentChapter })
      setProgress(saved)
      setChapterSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить главу')
    } finally {
      setSavingChapter(false)
    }
  }

  async function handlePublishNote(e: React.FormEvent) {
    e.preventDefault()
    if (isRichTextEmpty(noteHtml)) return

    setPublishing(true)
    setError(null)
    try {
      const saved = await createCampaignProgressNote(campaign.id, noteHtml)
      setProgress(saved)
      setNoteHtml('')
      setEditorKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось опубликовать заметку')
    } finally {
      setPublishing(false)
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm('Удалить эту заметку о прогрессе?')) return

    setDeletingNoteId(noteId)
    setError(null)
    try {
      await deleteCampaignProgressNote(campaign.id, noteId)
      setProgress((prev) => ({
        ...prev,
        notes: prev.notes.filter((note) => note.id !== noteId),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить заметку')
    } finally {
      setDeletingNoteId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-dnd-muted">Загрузка прогресса…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Прогресс кампании</h3>
        <p className="mt-1 text-sm text-dnd-muted">
          Публикуйте заметки о ходе сюжета — их видят все игроки кампании
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void handleSaveChapter(e)}
        className="rounded-xl border border-dnd-border bg-dnd-card p-6"
      >
        <label htmlFor="currentChapter" className="mb-1.5 block text-sm text-gray-300">
          Текущая глава
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="currentChapter"
            value={currentChapter}
            onChange={(e) => {
              setChapterSaved(false)
              setCurrentChapter(e.target.value)
            }}
            placeholder="Глава 3: Тёмный лес"
            className="min-w-[240px] flex-1 rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
          />
          <Button type="submit" className="!w-auto px-5" loading={savingChapter}>
            Сохранить главу
          </Button>
        </div>
        {chapterSaved && (
          <p className="mt-3 text-sm text-emerald-400">Текущая глава сохранена</p>
        )}
      </form>

      <form
        onSubmit={(e) => void handlePublishNote(e)}
        className="rounded-xl border border-dnd-gold/30 bg-dnd-card p-6"
      >
        <h4 className="font-medium text-white">Новая заметка о прогрессе</h4>
        <p className="mt-1 text-sm text-dnd-muted">
          Форматирование, ссылки и вложения до 10 МБ
        </p>
        <div className="mt-4">
          <RichTextEditor
            key={editorKey}
            placeholder="Что произошло на последней сессии, куда движется сюжет…"
            initialContent=""
            onChange={setNoteHtml}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            className="!w-auto px-6"
            loading={publishing}
            disabled={isRichTextEmpty(noteHtml)}
          >
            Опубликовать
          </Button>
        </div>
      </form>

      <CampaignProgressNotesFeed
        progress={progress}
        canManage
        deletingNoteId={deletingNoteId}
        onDeleteNote={(noteId) => void handleDeleteNote(noteId)}
      />
    </div>
  )
}
