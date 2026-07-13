import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useNotesStore } from '../store/notesStore'

export function NotesPage() {
  const { user } = useAuth()
  const content = useNotesStore((s) => s.content)
  const loading = useNotesStore((s) => s.loading)
  const saving = useNotesStore((s) => s.saving)
  const error = useNotesStore((s) => s.error)
  const fetchNotes = useNotesStore((s) => s.fetchNotes)
  const saveNotes = useNotesStore((s) => s.saveNotes)

  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const hasEditedRef = useRef(false)

  useEffect(() => {
    if (!user) return
    void fetchNotes()
  }, [user, fetchNotes])

  useEffect(() => {
    if (hasEditedRef.current) return
    setDraft(content)
  }, [content])

  function handleChange(value: string) {
    hasEditedRef.current = true
    setSaved(false)
    setDraft(value)
  }

  async function handleSave() {
    try {
      await saveNotes(draft)
      setSaved(true)
    } catch {
      // error shown via store
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Заметки</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            Личные заметки по кампаниям и сессиям
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-400">Сохранено</span>}
          <Button className="!w-auto px-6" onClick={handleSave} loading={saving}>
            Сохранить
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        {loading ? (
          <p className="text-sm text-dnd-muted">Загрузка…</p>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Запишите идеи, планы, напоминания..."
            rows={18}
            className="min-h-[320px] w-full resize-y rounded-lg border border-dnd-border bg-dnd-dark px-4 py-3 text-sm leading-relaxed text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
          />
        )}
        <p className="mt-3 text-xs text-dnd-muted">
          Заметки синхронизируются с аккаунтом через API
        </p>
      </div>
    </div>
  )
}
