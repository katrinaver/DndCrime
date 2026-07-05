export type CharacterCreationType = 'general' | 'campaign' | 'classic'

export interface CharacterAntiAchievement {
  id: string
  title: string
  earnedAt: string
}

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CharacterSheet {
  id: string
  name: string
  className: string
  level: number
  species: string
  background: string
  playerName: string
  alignment: string
  experiencePoints: number
  abilities: AbilityScores
  armorClass: number
  initiative: number
  speed: number
  maxHp: number
  currentHp: number
  tempHp: number
  hitDice: string
  proficiencyBonus: number
  savingThrows: string[]
  skills: string[]
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  features: string
  equipment: string
  spells: string
  creationType: CharacterCreationType
  campaignId?: string
  campaignName?: string
  questionnaireAnswers?: Record<string, string>
  antiAchievements?: CharacterAntiAchievement[]
  avatarFileName?: string
}

export interface CharacterListItem {
  id: string
  name: string
  className: string
  level: number
  species: string
  campaignName?: string
  creationType: CharacterCreationType
  updatedAt: string
}

export interface CampaignOption {
  id: string
  name: string
  master: string
  status: 'active' | 'paused' | 'completed'
}

export interface CampaignFormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file'
  options?: string[]
  placeholder?: string
  section?: string
}

export interface CampaignFormConfig {
  campaignId: string
  title: string
  description: string
  fields: CampaignFormField[]
}

export const DND_SKILLS = [
  'Атлетика',
  'Акробатика',
  'Ловкость рук',
  'Скрытность',
  'Магия',
  'История',
  'Анализ',
  'Природа',
  'Религия',
  'Внимательность',
  'Выживание',
  'Медицина',
  'Проницательность',
  'Животные',
  'Запугивание',
  'Выступление',
  'Обман',
  'Убеждение',
] as const

export const DND_SAVING_THROWS = [
  'Сила',
  'Ловкость',
  'Телосложение',
  'Интеллект',
  'Мудрость',
  'Харизма',
] as const

export { GENERAL_QUESTIONNAIRE_FIELDS } from './generalQuestionnaireFields'
export { SHEET_FIELD_CATALOG, getSheetFieldById } from './sheetFieldCatalog'
