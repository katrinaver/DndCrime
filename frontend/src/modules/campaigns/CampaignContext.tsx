import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../../context/AuthContext'
import type { CampaignFormConfig } from '../characters/types'
import { campaignFormConfigs as initialFormConfigs } from '../characters/campaignForms'
import { stubCampaignOptions } from '../characters/campaigns'
import {
  formatSessionDate,
  type Campaign,
  type CampaignCreateInput,
  type QuestionnaireFieldSetting,
} from './types'
import { buildQuestionnaireFields } from './questionnaireUtils'

interface CampaignContextValue {
  campaigns: Campaign[]
  userCampaignIds: string[]
  questionnaireConfigs: CampaignFormConfig[]
  getCampaignById: (id: string) => Campaign | undefined
  createCampaign: (
    input: CampaignCreateInput,
    questionnaireSettings: QuestionnaireFieldSetting[],
    antiAchievementPool: string[],
  ) => Campaign
  getQuestionnaireConfig: (campaignId: string) => CampaignFormConfig | undefined
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

const initialCampaigns: Campaign[] = stubCampaignOptions.map((option) => ({
  id: option.id,
  name: option.name,
  master: option.master,
  masterId: `master-${option.id}`,
  playerIds: [],
  players: option.id === '1' ? 5 : option.id === '2' ? 4 : 3,
  place: option.id === '1' ? 'Discord' : option.id === '2' ? 'Zoom' : '',
  setting:
    option.id === '1'
      ? 'Готика, хоррор и политика Баровии'
      : option.id === '2'
        ? 'Городское приключение с интригами'
        : 'Классический поход в подземелье',
  maxPlayers: 6,
  level: '1',
  extraParams: '',
  antiAchievementPool:
    option.id === '1'
      ? [
          'Попытался убедить дракона пожертвовать сокровища',
          'Забыл, зачем пришли в подземелье',
          'Критически провалил проверку Скрытности в таверне',
        ]
      : option.id === '2'
        ? [
            'Уронил факел в собственный инвентарь',
            'Согласился на «безобидную» сделку с неизвестным',
          ]
        : ['Использовал Огненный шар в узком коридоре'],
  lastSession: option.id === '1' ? '28.06.2026' : option.id === '2' ? '15.06.2026' : '01.05.2026',
  status: option.status,
}))

/** Заглушка: пользователь состоит в кампаниях 1 и 2. */
const STUB_MEMBER_CAMPAIGN_IDS = ['1', '2']

function getUserId(userEmail: string | undefined): string {
  return userEmail ? `user-${userEmail}` : 'dev-user'
}

function getMasterName(userEmail: string | undefined): string {
  if (!userEmail) return 'Мастер'
  return userEmail.split('@')[0] ?? 'Мастер'
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = getUserId(user?.email)
  const masterName = getMasterName(user?.email)

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [questionnaireConfigs, setQuestionnaireConfigs] =
    useState<CampaignFormConfig[]>(initialFormConfigs)
  const [memberCampaignIds, setMemberCampaignIds] = useState<string[]>(STUB_MEMBER_CAMPAIGN_IDS)

  const userCampaignIds = useMemo(() => {
    const owned = campaigns.filter((c) => c.masterId === userId).map((c) => c.id)
    return [...new Set([...memberCampaignIds, ...owned])]
  }, [campaigns, memberCampaignIds, userId])

  const getQuestionnaireConfig = useCallback(
    (campaignId: string) => questionnaireConfigs.find((config) => config.campaignId === campaignId),
    [questionnaireConfigs],
  )

  const getCampaignById = useCallback(
    (id: string) => campaigns.find((campaign) => campaign.id === id),
    [campaigns],
  )

  const createCampaign = useCallback(
    (
      input: CampaignCreateInput,
      questionnaireSettings: QuestionnaireFieldSetting[],
      antiAchievementPool: string[],
    ) => {
      const id = String(Date.now())
      const fields = buildQuestionnaireFields(questionnaireSettings)

      const campaign: Campaign = {
        id,
        name: input.name,
        master: masterName,
        masterId: userId,
        playerIds: [userId],
        players: 1,
        place: input.place,
        setting: input.setting,
        maxPlayers: Number(input.maxPlayers) || 4,
        level: input.level,
        extraParams: input.extraParams,
        antiAchievementPool,
        sessionDate: input.sessionDate || undefined,
        sessionTime: input.sessionTime || undefined,
        lastSession: input.sessionDate ? formatSessionDate(input.sessionDate) : undefined,
        status: 'active',
      }

      const formConfig: CampaignFormConfig = {
        campaignId: id,
        title: `Анкета: ${input.name}`,
        description: input.setting || 'Кастомная анкета персонажа для кампании',
        fields,
      }

      setCampaigns((prev) => [...prev, campaign])
      setQuestionnaireConfigs((prev) => [...prev, formConfig])
      setMemberCampaignIds((prev) => [...prev, id])

      return campaign
    },
    [masterName, userId],
  )

  const value = useMemo(
    () => ({
      campaigns,
      userCampaignIds,
      questionnaireConfigs,
      getCampaignById,
      createCampaign,
      getQuestionnaireConfig,
    }),
    [campaigns, userCampaignIds, questionnaireConfigs, getCampaignById, createCampaign, getQuestionnaireConfig],
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
