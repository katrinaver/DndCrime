import type { CampaignFormField } from './types'
import { SHEET_FIELD_CATALOG } from './sheetFieldCatalog'

const FREE_INPUT_IDS = new Set(['name', 'avatar', 'background'])

/** Поля листа D&D 2024 — всё через select/multiselect, кроме исключений. */
const SHEET_DROPDOWN_FIELDS = SHEET_FIELD_CATALOG.filter((field) => !FREE_INPUT_IDS.has(field.id))

/** Мета-поля общей анкеты (подбор кампании) — тоже только из списков. */
const META_FIELDS: CampaignFormField[] = [
  {
    id: 'experience',
    label: 'Опыт игры в D&D',
    type: 'select',
    options: ['Новичок', 'Играл 1–3 раза', 'Опытный игрок', 'Ветеран'],
    section: 'О игроке',
  },
  {
    id: 'role',
    label: 'Предпочитаемая роль в группе',
    type: 'select',
    options: ['Танк', 'Урон', 'Поддержка', 'Социальный', 'Универсал'],
    section: 'О игроке',
  },
  {
    id: 'boundaries',
    label: 'Границы и табу в игре',
    type: 'multiselect',
    options: [
      'Без насилия над детьми',
      'Без насилия над животными',
      'Без сексуального контента',
      'Без пыток и графики',
      'Без предательства между игроками',
      'Без PvP',
    ],
    section: 'О игроке',
  },
  {
    id: 'notes',
    label: 'Дополнительные пожелания',
    type: 'select',
    options: [
      'Хочу больше ролевки',
      'Хочу больше боёв',
      'Хочу исследовать мир',
      'Хочу быть дипломатом в группе',
      'Готов играть антагониста',
      'Нет особых пожеланий',
    ],
    section: 'О игроке',
  },
]

const FREE_INPUT_FIELDS = SHEET_FIELD_CATALOG.filter((field) => FREE_INPUT_IDS.has(field.id))

/** Общая анкета: имя, аватар и предыстория — свободный ввод, остальное — дропдауны/списки. */
export const GENERAL_QUESTIONNAIRE_FIELDS: CampaignFormField[] = [
  ...FREE_INPUT_FIELDS,
  ...META_FIELDS,
  ...SHEET_DROPDOWN_FIELDS,
]
