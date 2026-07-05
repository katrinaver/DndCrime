import { apiFetch } from '../lib/apiClient'
import type { Campaign, CampaignCreateInput, QuestionnaireFieldSetting } from '../modules/campaigns/types'
import type { CampaignFormConfig } from '../modules/characters/types'
import type { CharacterSummary } from '../modules/characters/types'

export function fetchCampaigns() {
  return apiFetch<Campaign[]>('/api/campaigns')
}

export function fetchCampaign(campaignId: string) {
  return apiFetch<Campaign>(`/api/campaigns/${campaignId}`)
}

export function createCampaign(
  input: CampaignCreateInput,
  questionnaireSettings: QuestionnaireFieldSetting[],
  antiAchievementPool: string[],
) {
  return apiFetch<Campaign>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      sessionDate: input.sessionDate,
      sessionTime: input.sessionTime,
      place: input.place,
      setting: input.setting,
      maxPlayers: Number(input.maxPlayers) || 4,
      level: input.level,
      extraParams: input.extraParams,
      antiAchievementPool,
      questionnaireSettings,
    }),
  })
}

export function fetchCampaignQuestionnaire(campaignId: string) {
  return apiFetch<CampaignFormConfig>(`/api/campaigns/${campaignId}/questionnaire`)
}

export function fetchCampaignParty(campaignId: string) {
  return apiFetch<CharacterSummary[]>(`/api/campaigns/${campaignId}/party`)
}
