import { Navigate, useParams } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { CharacterSheetForm } from '../modules/characters/CharacterSheetForm'
import { QuestionnaireForm } from '../modules/characters/QuestionnaireForm'
import { getCharacterById } from '../modules/characters/characterData'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import { creationTypeLabels } from '../modules/characters/utils'
import { GENERAL_QUESTIONNAIRE_FIELDS } from '../modules/characters/types'

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const { getQuestionnaireConfig } = useCampaigns()
  const character = id ? getCharacterById(id) : undefined

  if (!character) {
    return <Navigate to="/characters" replace />
  }

  const campaignConfig =
    character.campaignId ? getQuestionnaireConfig(character.campaignId) : undefined

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

      {character.creationType === 'general' && !character.className && (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-6 text-sm text-dnd-muted">
          Лист D&amp;D ещё не заполнен — персонаж создан только через общую анкету.
        </div>
      )}
    </div>
  )
}
