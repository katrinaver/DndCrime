import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { GENERAL_QUESTIONNAIRE_FIELDS } from '../modules/characters/types'

export function CharacterGeneralPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<string, string>>({})

  function handleChange(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleSubmit() {
    navigate('/characters')
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

      <QuestionnaireForm
        title="Анкета игрока"
        description="Универсальная форма — списки опций пока заглушка, позже настраиваются мастером"
        fields={GENERAL_QUESTIONNAIRE_FIELDS}
        values={values}
        onChange={handleChange}
      />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="!w-auto" onClick={() => navigate('/characters')}>
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={handleSubmit}>
          Сохранить анкету
        </Button>
      </div>
    </div>
  )
}
