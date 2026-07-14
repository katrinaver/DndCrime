import { create } from 'zustand'
import * as campaignsApi from '../api/campaigns'
import type {
  Campaign,
  CampaignAsset,
  CampaignCreateInput,
  CampaignProgress,
  CampaignUpdateInput,
  QuestionnaireFieldSetting,
} from '../modules/campaigns/types'

const EMPTY_ASSETS: CampaignAsset[] = []
import type { CampaignFormConfig } from '../modules/characters/types'
import type { NewsPost } from '../modules/news/types'

interface CampaignState {
  campaigns: Campaign[]
  questionnaires: Record<string, CampaignFormConfig>
  assetsByCampaign: Record<string, CampaignAsset[]>
  progressByCampaign: Record<string, CampaignProgress>
  loading: boolean
  error: string | null
  fetchCampaigns: () => Promise<void>
  fetchCampaignById: (campaignId: string) => Promise<Campaign | undefined>
  fetchQuestionnaire: (campaignId: string) => Promise<CampaignFormConfig | undefined>
  createCampaign: (
    input: CampaignCreateInput,
    questionnaireSettings: QuestionnaireFieldSetting[],
    antiAchievementPool: string[],
  ) => Promise<Campaign>
  updateCampaign: (campaignId: string, input: CampaignUpdateInput) => Promise<Campaign>
  publishCampaignInvitation: (campaignId: string) => Promise<{ post: NewsPost; campaign: Campaign }>
  joinCampaign: (campaignId: string) => Promise<Campaign>
  joinCampaignByInvite: (token: string) => Promise<Campaign>
  leaveCampaign: (campaignId: string) => Promise<void>
  deleteCampaign: (campaignId: string) => Promise<void>
  fetchCampaignAssets: (campaignId: string) => Promise<CampaignAsset[]>
  createCampaignAsset: (
    campaignId: string,
    asset: Pick<CampaignAsset, 'title' | 'type' | 'description' | 'url'>,
  ) => Promise<CampaignAsset>
  updateCampaignAsset: (
    campaignId: string,
    assetId: string,
    asset: Pick<CampaignAsset, 'title' | 'type' | 'description' | 'url'>,
  ) => Promise<CampaignAsset>
  deleteCampaignAsset: (campaignId: string, assetId: string) => Promise<void>
  fetchCampaignProgress: (campaignId: string) => Promise<CampaignProgress>
  saveCampaignProgress: (
    campaignId: string,
    progress: Pick<CampaignProgress, 'currentChapter'>,
  ) => Promise<CampaignProgress>
  createCampaignProgressNote: (campaignId: string, content: string) => Promise<CampaignProgress>
  deleteCampaignProgressNote: (campaignId: string, noteId: string) => Promise<void>
  getCampaignById: (id: string) => Campaign | undefined
  getQuestionnaireConfig: (campaignId: string) => CampaignFormConfig | undefined
  getCampaignAssets: (campaignId: string) => CampaignAsset[]
  getCampaignProgress: (campaignId: string) => CampaignProgress | undefined
  reset: () => void
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  questionnaires: {},
  assetsByCampaign: {},
  progressByCampaign: {},
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

  fetchCampaignById: async (campaignId) => {
    const cached = get().campaigns.find((c) => c.id === campaignId)
    if (cached) return cached

    try {
      const campaign = await campaignsApi.fetchCampaign(campaignId)
      set((state) => {
        const exists = state.campaigns.some((c) => c.id === campaignId)
        return {
          campaigns: exists
            ? state.campaigns.map((c) => (c.id === campaignId ? campaign : c))
            : [...state.campaigns, campaign],
          error: null,
        }
      })
      return campaign
    } catch {
      return undefined
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

  updateCampaign: async (campaignId, input) => {
    const updated = await campaignsApi.updateCampaign(campaignId, input)
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === campaignId ? updated : c)),
    }))
    return updated
  },

  publishCampaignInvitation: async (campaignId) => {
    const result = await campaignsApi.publishCampaignInvitation(campaignId)
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === campaignId ? result.campaign : c)),
    }))
    return result
  },

  joinCampaign: async (campaignId) => {
    const campaign = await campaignsApi.joinCampaign(campaignId)
    set((state) => {
      const exists = state.campaigns.some((c) => c.id === campaignId)
      return {
        campaigns: exists
          ? state.campaigns.map((c) => (c.id === campaignId ? campaign : c))
          : [...state.campaigns, campaign],
      }
    })
    return campaign
  },

  joinCampaignByInvite: async (token) => {
    const campaign = await campaignsApi.joinCampaignByInvite(token)
    set((state) => {
      const exists = state.campaigns.some((c) => c.id === campaign.id)
      return {
        campaigns: exists
          ? state.campaigns.map((c) => (c.id === campaign.id ? campaign : c))
          : [...state.campaigns, campaign],
      }
    })
    return campaign
  },

  leaveCampaign: async (campaignId) => {
    await campaignsApi.leaveCampaign(campaignId)
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== campaignId),
    }))
  },

  deleteCampaign: async (campaignId) => {
    await campaignsApi.deleteCampaign(campaignId)
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== campaignId),
      assetsByCampaign: Object.fromEntries(
        Object.entries(state.assetsByCampaign).filter(([id]) => id !== campaignId),
      ),
      progressByCampaign: Object.fromEntries(
        Object.entries(state.progressByCampaign).filter(([id]) => id !== campaignId),
      ),
    }))
  },

  fetchCampaignAssets: async (campaignId) => {
    const assets = await campaignsApi.fetchCampaignAssets(campaignId)
    const list = Array.isArray(assets) ? assets : []
    set((state) => ({
      assetsByCampaign: { ...state.assetsByCampaign, [campaignId]: list },
    }))
    return list
  },

  createCampaignAsset: async (campaignId, asset) => {
    const created = await campaignsApi.createCampaignAsset(campaignId, asset)
    set((state) => ({
      assetsByCampaign: {
        ...state.assetsByCampaign,
        [campaignId]: [...(state.assetsByCampaign[campaignId] ?? []), created],
      },
    }))
    return created
  },

  updateCampaignAsset: async (campaignId, assetId, asset) => {
    const updated = await campaignsApi.updateCampaignAsset(campaignId, assetId, asset)
    set((state) => ({
      assetsByCampaign: {
        ...state.assetsByCampaign,
        [campaignId]: (state.assetsByCampaign[campaignId] ?? []).map((a) =>
          a.id === assetId ? updated : a,
        ),
      },
    }))
    return updated
  },

  deleteCampaignAsset: async (campaignId, assetId) => {
    await campaignsApi.deleteCampaignAsset(campaignId, assetId)
    set((state) => ({
      assetsByCampaign: {
        ...state.assetsByCampaign,
        [campaignId]: (state.assetsByCampaign[campaignId] ?? []).filter((a) => a.id !== assetId),
      },
    }))
  },

  fetchCampaignProgress: async (campaignId) => {
    const progress = await campaignsApi.fetchCampaignProgress(campaignId)
    set((state) => ({
      progressByCampaign: { ...state.progressByCampaign, [campaignId]: progress },
    }))
    return progress
  },

  saveCampaignProgress: async (campaignId, progress) => {
    const saved = await campaignsApi.saveCampaignProgress(campaignId, progress)
    set((state) => ({
      progressByCampaign: { ...state.progressByCampaign, [campaignId]: saved },
    }))
    return saved
  },

  createCampaignProgressNote: async (campaignId, content) => {
    const saved = await campaignsApi.createCampaignProgressNote(campaignId, content)
    set((state) => ({
      progressByCampaign: { ...state.progressByCampaign, [campaignId]: saved },
    }))
    return saved
  },

  deleteCampaignProgressNote: async (campaignId, noteId) => {
    await campaignsApi.deleteCampaignProgressNote(campaignId, noteId)
    set((state) => {
      const current = state.progressByCampaign[campaignId]
      if (!current) return state
      return {
        progressByCampaign: {
          ...state.progressByCampaign,
          [campaignId]: {
            ...current,
            notes: current.notes.filter((note) => note.id !== noteId),
          },
        },
      }
    })
  },

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  getQuestionnaireConfig: (campaignId) => get().questionnaires[campaignId],

  getCampaignAssets: (campaignId) => get().assetsByCampaign[campaignId] ?? EMPTY_ASSETS,

  getCampaignProgress: (campaignId) => get().progressByCampaign[campaignId],

  reset: () =>
    set({
      campaigns: [],
      questionnaires: {},
      assetsByCampaign: {},
      progressByCampaign: {},
      loading: false,
      error: null,
    }),
}))
