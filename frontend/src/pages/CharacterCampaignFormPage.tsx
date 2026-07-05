import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import type { CharacterSheet } from '../modules/characters/types'

export function CharacterCampaignFormPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { campaigns, getQuestionnaireConfig } = useCampaigns()
  const config = campaignId ? getQuestionnaireConfig(campaignId) : undefined
  const campaign = campaigns.find((c) => c.id === campaignId)

  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>({})
  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...emptyCharacterSheet(),
    creationType: 'campaign',
    campaignId: campaignId ?? '',
    campaignName: campaign?.name ?? '',
  }))

  if (!campaignId || !config || !campaign) {
    return <Navigate to="/characters/new/campaign" replace />
  }

  function handleQuestionnaireChange(id: string, value: string) {
    setQuestionnaire((prev) => ({ ...prev, [id]: value }))
  }

  function handleSheetChange(updates: Partial<CharacterSheet>) {
    setSheet((prev) => ({ ...prev, ...updates }))
  }

  function handleSubmit() {
    navigate('/characters')
  }

  return (
    <div>
      <BackLink to="/characters/new/campaign" label="← К выбору кампании" />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">{config.title}</h2>
        <p className="mt-1 text-sm text-dnd-muted">{config.description}</p>
      </div>

      <div className="space-y-6">
        <QuestionnaireForm
          title="Анкета кампании"
          fields={config.fields}
          values={questionnaire}
          onChange={handleQuestionnaireChange}
        />

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Лист персонажа D&amp;D 5e</h3>
          <CharacterSheetForm sheet={sheet} onChange={handleSheetChange} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          className="!w-auto"
          onClick={() => navigate('/characters/new/campaign')}
        >
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={handleSubmit}>
          Создать персонажа
        </Button>
      </div>
    </div>
  )
}
