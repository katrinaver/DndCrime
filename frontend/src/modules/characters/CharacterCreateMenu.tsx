import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { parseLssJson } from './lssJson'

const menuItems = [
  {
    label: 'Пройти общую анкету',
    description: 'Универсальная анкета для любой кампании',
    path: '/characters/new/general',
  },
  {
    label: 'Пройти анкету для конкретной кампании',
    description: 'Выбор кампании и кастомная форма мастера',
    path: '/characters/new/campaign',
  },
  {
    label: 'Заполнить с нуля',
    description: 'Классический лист персонажа D&D 5e (2024)',
    path: '/characters/new/classic',
  },
]

export function CharacterCreateMenu() {
  const [open, setOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setImportError(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(path: string) {
    setOpen(false)
    setImportError(null)
    navigate(path)
  }

  async function handleImportFile(file: File) {
    try {
      const importedSheet = parseLssJson(await file.text())
      setOpen(false)
      setImportError(null)
      navigate('/characters/new/classic', { state: { importedSheet } })
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Не удалось прочитать файл')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button className="!w-auto" onClick={() => setOpen((v) => !v)}>
        Создать персонажа
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void handleImportFile(file)
        }}
      />

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-dnd-border bg-dnd-card shadow-2xl">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleSelect(item.path)}
              className="flex w-full flex-col items-start gap-0.5 border-b border-dnd-border/60 px-4 py-3 text-left transition last:border-0 hover:bg-dnd-dark/50"
            >
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className="text-xs text-dnd-muted">{item.description}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setImportError(null)
              fileInputRef.current?.click()
            }}
            className="flex w-full flex-col items-start gap-0.5 border-t border-dnd-border/60 px-4 py-3 text-left transition hover:bg-dnd-dark/50"
          >
            <span className="text-sm font-medium text-white">Импортировать из JSON</span>
            <span className="text-xs text-dnd-muted">
              Файл экспорта Long Story Short или DndCrime
            </span>
          </button>
          {importError && (
            <p className="border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
              {importError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
