import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCampaignQuestionnaire } from '../modules/campaigns/useCampaignQuestionnaire'
import { useResolvedCampaign } from '../modules/campaigns/useResolvedCampaign'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { emptyCharacterSheet } from '../modules/characters/characterData'
import type { CharacterSheet } from '../modules/characters/types'
import { useCharacterStore } from '../store/characterStore'

type CampaignFormLocationState = {
  fromCampaign?: boolean
}

export function CharacterCampaignFormPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const locationState = location.state as CampaignFormLocationState | null

  const { campaign, resolving, notFound } = useResolvedCampaign(campaignId, user?.id)
  const { config, loading: questionnaireLoading, notFound: questionnaireNotFound } =
    useCampaignQuestionnaire(campaignId)

  const createCharacter = useCharacterStore((s) => s.createCharacter)
  const existingCharacter = useCharacterStore((s) =>
    campaignId ? s.getCharacterByCampaignId(campaignId) : undefined,
  )

  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>({})
  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...emptyCharacterSheet(),
    creationType: 'campaign',
    campaignId: campaignId ?? '',
    campaignName: '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setSheet((prev) => ({
      ...prev,
      campaignId: campaign.id,
      campaignName: campaign.name,
    }))
  }, [campaign])

  if (!campaignId) {
    return <Navigate to="/characters/new/campaign" replace />
  }

  if (resolving) {
    return <p className="mt-8 text-sm text-dnd-muted">Загрузка кампании…</p>
  }

  if (!campaign || notFound) {
    return <Navigate to="/characters/new/campaign" replace />
  }

  if (existingCharacter) {
    return <Navigate to={`/characters/${existingCharacter.id}`} replace />
  }

  const backTo = locationState?.fromCampaign
    ? `/campaigns/${campaignId}/menu`
    : '/characters/new/campaign'
  const backLabel = locationState?.fromCampaign ? '← К кампании' : '← К выбору кампании'

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
      const created = await createCharacter({
        ...sheet,
        name: questionnaire.name || sheet.name,
        background: questionnaire.background || sheet.background,
        className: questionnaire.className || sheet.className,
        species: questionnaire.species || sheet.species,
        level: questionnaire.level ? Number(questionnaire.level) : sheet.level,
        campaignId,
        campaignName: campaign.name,
        avatarFileName: questionnaire.avatar ?? sheet.avatarFileName,
        questionnaireAnswers: questionnaire,
      })
      navigate(locationState?.fromCampaign ? `/campaigns/${campaignId}/menu` : `/characters/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать персонажа')
    } finally {
      setSubmitting(false)
    }
  }

  if (questionnaireLoading) {
    return (
      <div>
        <BackLink to={backTo} label={backLabel} />
        <p className="mt-8 text-sm text-dnd-muted">Загрузка анкеты кампании…</p>
      </div>
    )
  }

  if (questionnaireNotFound || !config) {
    return (
      <div>
        <BackLink to={backTo} label={backLabel} />
        <div className="mt-8 rounded-xl border border-dnd-border bg-dnd-card p-6 text-sm text-dnd-muted">
          Анкета для этой кампании не найдена. Попросите мастера настроить её при создании партии.
        </div>
      </div>
    )
  }

  return (
    <div>
      <BackLink to={backTo} label={backLabel} />

      <div className="mt-4 mb-6">
        <p className="text-sm text-dnd-muted">{campaign.name}</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{config.title}</h2>
        {config.description && (
          <p className="mt-2 text-sm text-dnd-muted">{config.description}</p>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-6">
        {config.fields.length > 0 ? (
          <QuestionnaireForm
            title="Анкета мастера"
            description="Ответьте на вопросы, которые мастер подготовил для этой партии"
            fields={config.fields}
            values={questionnaire}
            onChange={handleQuestionnaireChange}
          />
        ) : (
          <div className="rounded-xl border border-dnd-border bg-dnd-card p-6 text-sm text-dnd-muted">
            Мастер не добавил дополнительных вопросов — заполните лист персонажа ниже.
          </div>
        )}

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Лист персонажа D&amp;D 5e</h3>
          <CharacterSheetForm sheet={sheet} onChange={handleSheetChange} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" className="!w-auto" onClick={() => navigate(backTo)}>
          Отмена
        </Button>
        <Button className="!w-auto px-6" onClick={() => void handleSubmit()} loading={submitting}>
          Создать персонажа
        </Button>
      </div>
    </div>
  )
}
