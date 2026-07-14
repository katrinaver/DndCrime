export type CampaignStatus = 'active' | 'paused' | 'completed'

export type CampaignAssetType = 'map' | 'handout' | 'note' | 'link' | 'file'

export interface CampaignAsset {
  id: string
  campaignId: string
  title: string
  type: CampaignAssetType
  description: string
  url?: string
  createdAt?: string
  updatedAt?: string
}

export interface CampaignProgressNote {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt?: string
}

export interface CampaignMilestone {
  id: string
  title: string
  description: string
  completed: boolean
  completedAt?: string
  order: number
}

export interface CampaignProgress {
  campaignId: string
  currentChapter: string
  notes: CampaignProgressNote[]
  summary?: string
  milestones?: CampaignMilestone[]
  updatedAt?: string
}

export interface CampaignUpdateInput {
  name: string
  place: string
  setting: string
  maxPlayers: number
  level: string
  extraParams: string
  antiAchievementPool: string[]
  sessionDate: string
  sessionTime: string
  lastSession: string
  status: CampaignStatus
}

export interface CampaignMasterProfile {
  name: string
  description?: string
  avatarUrl?: string
}

/** Ограниченная карточка кампании для страницы приглашения по ссылке. */
export interface CampaignInvitePreview {
  campaignId: string
  name: string
  master: CampaignMasterProfile
  setting: string
  level: string
  players: number
  maxPlayers: number
  status: CampaignStatus
  isMember: boolean
}

export interface Campaign {
  id: string
  name: string
  master: string
  masterId: string
  masterProfile?: CampaignMasterProfile
  playerIds: string[]
  players: number
  place: string
  setting: string
  maxPlayers: number
  level: string
  extraParams: string
  /** Шаблоны антидостижений — задаются при создании, присваиваются персонажам мастером. */
  antiAchievementPool: string[]
  sessionDate?: string
  sessionTime?: string
  lastSession?: string
  status: CampaignStatus
  invitationPostId?: string
}

export interface CampaignCreateInput {
  name: string
  sessionDate: string
  sessionTime: string
  place: string
  setting: string
  maxPlayers: string
  level: string
  extraParams: string
}

export interface QuestionnaireFieldSetting {
  fieldId: string
  enabled: boolean
  selectedOptions: string[]
}

export function formatSessionDate(date: string): string {
  if (!date) return '—'
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}
