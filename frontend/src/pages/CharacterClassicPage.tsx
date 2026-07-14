import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import type { CharacterSheet } from '../modules/characters/types'
import { useCharacterStore } from '../store/characterStore'

export function CharacterClassicPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const createCharacter = useCharacterStore((s) => s.createCharacter)

  const importedSheet = (location.state as { importedSheet?: CharacterSheet } | null)
    ?.importedSheet

  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...emptyCharacterSheet(),
    ...importedSheet,
    creationType: 'classic',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(updates: Partial<CharacterSheet>) {
    setSheet((prev) => ({ ...prev, ...updates }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await createCharacter(sheet)
      navigate('/characters')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать персонажа')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">Новый персонаж</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          {importedSheet
            ? 'Данные импортированы из JSON — проверьте лист и создайте персонажа'
            : 'Классический лист персонажа D&D 5e (редакция 2024)'}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <CharacterSheetForm sheet={sheet} onChange={handleChange} />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="!w-auto" onClick={() => navigate('/characters')}>
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={() => void handleSubmit()} loading={submitting}>
          Создать персонажа
        </Button>
      </div>
    </div>
  )
}
