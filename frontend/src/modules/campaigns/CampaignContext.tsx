import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { useCampaignStore } from '../../store/campaignStore'
import type { CampaignFormConfig } from '../characters/types'
import type { Campaign, CampaignCreateInput, QuestionnaireFieldSetting } from './types'

interface CampaignContextValue {
  campaigns: Campaign[]
  userCampaignIds: string[]
  loading: boolean
  error: string | null
  getCampaignById: (id: string) => Campaign | undefined
  createCampaign: (
    input: CampaignCreateInput,
    questionnaireSettings: QuestionnaireFieldSetting[],
    antiAchievementPool: string[],
  ) => Promise<Campaign>
  getQuestionnaireConfig: (campaignId: string) => CampaignFormConfig | undefined
  fetchQuestionnaire: (campaignId: string) => Promise<CampaignFormConfig | undefined>
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const campaigns = useCampaignStore((s) => s.campaigns)
  const loading = useCampaignStore((s) => s.loading)
  const error = useCampaignStore((s) => s.error)
  const storeGetCampaignById = useCampaignStore((s) => s.getCampaignById)
  const storeCreateCampaign = useCampaignStore((s) => s.createCampaign)
  const storeGetQuestionnaireConfig = useCampaignStore((s) => s.getQuestionnaireConfig)
  const storeFetchQuestionnaire = useCampaignStore((s) => s.fetchQuestionnaire)

  const userCampaignIds = useMemo(() => campaigns.map((c) => c.id), [campaigns])

  const getCampaignById = useCallback(
    (id: string) => storeGetCampaignById(id),
    [storeGetCampaignById],
  )

  const createCampaign = useCallback(
    (
      input: CampaignCreateInput,
      questionnaireSettings: QuestionnaireFieldSetting[],
      antiAchievementPool: string[],
    ) => storeCreateCampaign(input, questionnaireSettings, antiAchievementPool),
    [storeCreateCampaign],
  )

  const getQuestionnaireConfig = useCallback(
    (campaignId: string) => storeGetQuestionnaireConfig(campaignId),
    [storeGetQuestionnaireConfig],
  )

  const fetchQuestionnaire = useCallback(
    (campaignId: string) => storeFetchQuestionnaire(campaignId),
    [storeFetchQuestionnaire],
  )

  const value = useMemo(
    () => ({
      campaigns,
      userCampaignIds,
      loading,
      error,
      getCampaignById,
      createCampaign,
      getQuestionnaireConfig,
      fetchQuestionnaire,
    }),
    [
      campaigns,
      userCampaignIds,
      loading,
      error,
      getCampaignById,
      createCampaign,
      getQuestionnaireConfig,
      fetchQuestionnaire,
    ],
  )

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>
}

export function useCampaigns() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaigns must be used within CampaignProvider')
  }
  return context
}
