import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { GENERAL_QUESTIONNAIRE_FIELDS } from '../modules/characters/types'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import { useCharacterStore } from '../store/characterStore'

export function CharacterGeneralPage() {
  const navigate = useNavigate()
  const createCharacter = useCharacterStore((s) => s.createCharacter)

  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const sheet = {
        ...emptyCharacterSheet(),
        creationType: 'general' as const,
        name: values.name ?? 'Без имени',
        questionnaireAnswers: values,
      }
      await createCharacter(sheet)
      navigate('/characters')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить анкету')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">Общая анкета</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Заполните анкету персонажа — поля листа D&amp;D 2024 выбираются из списков
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <QuestionnaireForm
        title="Анкета игрока"
        description="Универсальная форма — списки опций настраиваются мастером"
        fields={GENERAL_QUESTIONNAIRE_FIELDS}
        values={values}
        onChange={handleChange}
      />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="!w-auto" onClick={() => navigate('/characters')}>
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={() => void handleSubmit()} loading={submitting}>
          Сохранить анкету
        </Button>
      </div>
    </div>
  )
}
