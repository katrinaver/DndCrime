import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { useCampaignQuestionnaire } from '../modules/campaigns/useCampaignQuestionnaire'
import { creationTypeLabels } from '../modules/characters/utils'
import { GENERAL_QUESTIONNAIRE_FIELDS } from '../modules/characters/types'
import { useCharacterStore } from '../store/characterStore'

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const character = useCharacterStore((s) => (id ? s.getCharacterById(id) : undefined))
  const loading = useCharacterStore((s) => s.loading)
  const fetchCharacter = useCharacterStore((s) => s.fetchCharacter)
  const { config: campaignConfig } = useCampaignQuestionnaire(character?.campaignId)

  useEffect(() => {
    if (!id) return
    void fetchCharacter(id)
  }, [id, fetchCharacter])

  if (loading && !character) {
    return <div className="mt-8 text-sm text-dnd-muted">Загрузка персонажа…</div>
  }

  if (!character) {
    return <Navigate to="/characters" replace />
  }

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{character.name}</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            {creationTypeLabels[character.creationType]}
            {character.campaignName && ` · ${character.campaignName}`}
          </p>
        </div>
      </div>

      {(character.creationType === 'general' || character.creationType === 'campaign') &&
        character.questionnaireAnswers && (
          <div className="mb-6">
            <QuestionnaireForm
              title={
                character.creationType === 'general'
                  ? 'Общая анкета'
                  : (campaignConfig?.title ?? 'Анкета кампании')
              }
              description={campaignConfig?.description}
              fields={
                character.creationType === 'general'
                  ? GENERAL_QUESTIONNAIRE_FIELDS
                  : (campaignConfig?.fields ?? [])
              }
              values={character.questionnaireAnswers}
              readOnly
            />
          </div>
        )}

      {(character.creationType === 'classic' || character.creationType === 'campaign') && (
        <CharacterSheetForm sheet={character} readOnly />
      )}
    </div>
  )
}
