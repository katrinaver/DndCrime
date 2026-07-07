import { create } from 'zustand'
import * as campaignsApi from '../api/campaigns'
import type { Campaign, CampaignCreateInput, QuestionnaireFieldSetting } from '../modules/campaigns/types'
import type { CampaignFormConfig } from '../modules/characters/types'

interface CampaignState {
  campaigns: Campaign[]
  questionnaires: Record<string, CampaignFormConfig>
  loading: boolean
  error: string | null
  fetchCampaigns: () => Promise<void>
  fetchQuestionnaire: (campaignId: string) => Promise<CampaignFormConfig | undefined>
  createCampaign: (
    input: CampaignCreateInput,
    questionnaireSettings: QuestionnaireFieldSetting[],
    antiAchievementPool: string[],
  ) => Promise<Campaign>
  getCampaignById: (id: string) => Campaign | undefined
  getQuestionnaireConfig: (campaignId: string) => CampaignFormConfig | undefined
  reset: () => void
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  questionnaires: {},
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true, error: null })
    try {
      const data = await campaignsApi.fetchCampaigns()
      const campaigns = Array.isArray(data) ? data : []
      set({ campaigns, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить кампании',
      })
    }
  },

  fetchQuestionnaire: async (campaignId) => {
    const cached = get().questionnaires[campaignId]
    if (cached) return cached

    try {
      const questionnaire = await campaignsApi.fetchCampaignQuestionnaire(campaignId)
      set((state) => ({
        questionnaires: { ...state.questionnaires, [campaignId]: questionnaire },
      }))
      return questionnaire
    } catch {
      return undefined
    }
  },

  createCampaign: async (input, questionnaireSettings, antiAchievementPool) => {
    const campaign = await campaignsApi.createCampaign(
      input,
      questionnaireSettings,
      antiAchievementPool,
    )
    set((state) => ({ campaigns: [...state.campaigns, campaign] }))
    return campaign
  },

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  getQuestionnaireConfig: (campaignId) => get().questionnaires[campaignId],

  reset: () => set({ campaigns: [], questionnaires: {}, loading: false, error: null }),
}))
