import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

const menuItems = [
  {
    label: 'Пройти общую анкету',
    description: 'Универсальная анкета для любой кампании',
    path: '/characters/new/general',
  },
  {
    label: 'Пройти анкету для конкретной компании',
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
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="relative" ref={ref}>
      <Button className="!w-auto" onClick={() => setOpen((v) => !v)}>
        Создать персонажа
      </Button>

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
        </div>
      )}
    </div>
  )
}
