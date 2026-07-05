import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { loadUserNotes, saveUserNotes } from '../modules/notes/notesStorage'

export function NotesPage() {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'

  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNotes(loadUserNotes(userId))
  }, [userId])

  function handleChange(value: string) {
    setSaved(false)
    setNotes(value)
  }

  function handleSave() {
    saveUserNotes(userId, notes)
    setSaved(true)
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
          <Button className="!w-auto px-6" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Запишите идеи, планы, напоминания..."
          rows={18}
          className="min-h-[320px] w-full resize-y rounded-lg border border-dnd-border bg-dnd-dark px-4 py-3 text-sm leading-relaxed text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
        />
        <p className="mt-3 text-xs text-dnd-muted">
          Заметки сохраняются локально в браузере — позже синхронизируем с аккаунтом
        </p>
      </div>
    </div>
  )
}
