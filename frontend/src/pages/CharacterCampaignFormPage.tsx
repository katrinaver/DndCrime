import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import type { CharacterSheet } from '../modules/characters/types'
import { useCharacterStore } from '../store/characterStore'

export function CharacterCampaignFormPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { campaigns, getQuestionnaireConfig, fetchQuestionnaire } = useCampaigns()
  const createCharacter = useCharacterStore((s) => s.createCharacter)

  const config = campaignId ? getQuestionnaireConfig(campaignId) : undefined
  const campaign = campaigns.find((c) => c.id === campaignId)

  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>({})
  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...emptyCharacterSheet(),
    creationType: 'campaign',
    campaignId: campaignId ?? '',
    campaignName: campaign?.name ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (campaignId) void fetchQuestionnaire(campaignId)
  }, [campaignId, fetchQuestionnaire])

  if (!campaignId || !campaign) {
    return <Navigate to="/characters/new/campaign" replace />
  }

  if (!config) {
    return <div className="mt-8 text-sm text-dnd-muted">Загрузка анкеты кампании…</div>
  }

  function handleQuestionnaireChange(id: string, value: string) {
    setQuestionnaire((prev) => ({ ...prev, [id]: value }))
  }

  function handleSheetChange(updates: Partial<CharacterSheet>) {
    setSheet((prev) => ({ ...prev, ...updates }))
  }

  async function handleSubmit() {
    if (!campaign) return
    setSubmitting(true)
    setError(null)
    try {
      await createCharacter({
        ...sheet,
        campaignId,
        campaignName: campaign.name,
        questionnaireAnswers: questionnaire,
      })
      navigate('/characters')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать персонажа')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <BackLink to="/characters/new/campaign" label="← К выбору кампании" />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">{config.title}</h2>
        <p className="mt-1 text-sm text-dnd-muted">{config.description}</p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

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
        <Button className="!w-auto px-6" onClick={() => void handleSubmit()} loading={submitting}>
          Создать персонажа
        </Button>
      </div>
    </div>
  )
}
