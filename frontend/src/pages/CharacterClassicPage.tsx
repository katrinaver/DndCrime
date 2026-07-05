import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import type { CharacterSheet } from '../modules/characters/types'

export function CharacterClassicPage() {
  const navigate = useNavigate()
  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...emptyCharacterSheet(),
    creationType: 'classic',
  }))

  function handleChange(updates: Partial<CharacterSheet>) {
    setSheet((prev) => ({ ...prev, ...updates }))
  }

  function handleSubmit() {
    navigate('/characters')
  }

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">Новый персонаж</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Классический лист персонажа Dungeons &amp; Dragons 5e (редакция 2024)
        </p>
      </div>

      <CharacterSheetForm sheet={sheet} onChange={handleChange} />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="!w-auto" onClick={() => navigate('/characters')}>
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={handleSubmit}>
          Создать персонажа
        </Button>
      </div>
    </div>
  )
}
