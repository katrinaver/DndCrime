export type CampaignStatus = 'active' | 'paused' | 'completed'

export interface Campaign {
  id: string
  name: string
  master: string
  masterId: string
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
