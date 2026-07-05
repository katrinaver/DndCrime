import { useState } from 'react'
import { Button } from '../../components/ui/Button'

interface AntiAchievementsEditorProps {
  items: string[]
  onChange: (items: string[]) => void
}

export function AntiAchievementsEditor({ items, onChange }: AntiAchievementsEditorProps) {
  const [draft, setDraft] = useState('')

  function addItem(value: string) {
    const trimmed = value.trim()
    if (!trimmed || items.includes(trimmed)) return
    onChange([...items, trimmed])
    setDraft('')
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        Пул антидостижений
      </label>
      <p className="mb-3 text-xs text-dnd-muted">
        Задайте список при создании кампании — позже мастер будет присваивать их персонажам
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem(draft)
            }
          }}
          placeholder="Например: Уронил факел в собственный инвентарь"
          className="min-w-0 flex-1 rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
        />
        <Button type="button" className="!w-auto shrink-0 px-4" onClick={() => addItem(draft)}>
          Добавить
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-dnd-border bg-dnd-dark/50 px-3 py-2 text-sm text-gray-200"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="shrink-0 text-xs text-dnd-muted transition hover:text-red-400"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
