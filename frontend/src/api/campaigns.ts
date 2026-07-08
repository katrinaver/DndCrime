import { apiFetch } from '../lib/apiClient'
import type {
  Campaign,
  CampaignAsset,
  CampaignCreateInput,
  CampaignProgress,
  CampaignUpdateInput,
  QuestionnaireFieldSetting,
} from '../modules/campaigns/types'
import type { NewsPost } from '../modules/news/types'
import type { CampaignFormConfig } from '../modules/characters/types'
import type { CharacterSummary } from '../modules/characters/types'

export function fetchCampaigns() {
  return apiFetch<Campaign[]>('/api/campaigns')
}

export function fetchCampaign(campaignId: string) {
  return apiFetch<Campaign>(`/api/campaigns/${campaignId}`)
}

export function updateCampaign(campaignId: string, input: CampaignUpdateInput) {
  return apiFetch<Campaign>(`/api/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
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

export function fetchCampaignAssets(campaignId: string) {
  return apiFetch<CampaignAsset[]>(`/api/campaigns/${campaignId}/assets`)
}

export function createCampaignAsset(
  campaignId: string,
  asset: Pick<CampaignAsset, 'title' | 'type' | 'description' | 'url'>,
) {
  return apiFetch<CampaignAsset>(`/api/campaigns/${campaignId}/assets`, {
    method: 'POST',
    body: JSON.stringify(asset),
  })
}

export function updateCampaignAsset(
  campaignId: string,
  assetId: string,
  asset: Pick<CampaignAsset, 'title' | 'type' | 'description' | 'url'>,
) {
  return apiFetch<CampaignAsset>(`/api/campaigns/${campaignId}/assets/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(asset),
  })
}

export function deleteCampaignAsset(campaignId: string, assetId: string) {
  return apiFetch<void>(`/api/campaigns/${campaignId}/assets/${assetId}`, {
    method: 'DELETE',
  })
}

export function fetchCampaignProgress(campaignId: string) {
  return apiFetch<CampaignProgress>(`/api/campaigns/${campaignId}/progress`)
}

export function saveCampaignProgress(campaignId: string, progress: Pick<CampaignProgress, 'currentChapter'>) {
  return apiFetch<CampaignProgress>(`/api/campaigns/${campaignId}/progress`, {
    method: 'PUT',
    body: JSON.stringify(progress),
  })
}

export function createCampaignProgressNote(campaignId: string, content: string) {
  return apiFetch<CampaignProgress>(`/api/campaigns/${campaignId}/progress/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function deleteCampaignProgressNote(campaignId: string, noteId: string) {
  return apiFetch<void>(`/api/campaigns/${campaignId}/progress/notes/${noteId}`, {
    method: 'DELETE',
  })
}

export interface PublishInvitationResponse {
  post: NewsPost
  campaign: Campaign
  already?: boolean
}

export function publishCampaignInvitation(campaignId: string) {
  return apiFetch<PublishInvitationResponse>(`/api/campaigns/${campaignId}/invitation`, {
    method: 'POST',
  })
}

export function joinCampaign(campaignId: string) {
  return apiFetch<Campaign>(`/api/campaigns/${campaignId}/join`, {
    method: 'POST',
  })
}

export function leaveCampaign(campaignId: string) {
  return apiFetch<void>(`/api/campaigns/${campaignId}/leave`, {
    method: 'POST',
  })
}

export function deleteCampaign(campaignId: string) {
  return apiFetch<void>(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
  })
}
