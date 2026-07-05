import { getSheetFieldById, SHEET_FIELD_CATALOG } from '../characters/sheetFieldCatalog'
import type { CampaignFormField } from '../characters/types'
import type { QuestionnaireFieldSetting } from './types'

export function createDefaultQuestionnaireSettings(): QuestionnaireFieldSetting[] {
  return SHEET_FIELD_CATALOG.map((field) => ({
    fieldId: field.id,
    enabled: ['name', 'background', 'className', 'species', 'level'].includes(field.id),
    selectedOptions: field.options ? [...field.options] : [],
  }))
}

export function buildQuestionnaireFields(settings: QuestionnaireFieldSetting[]): CampaignFormField[] {
  return settings
    .filter((setting) => setting.enabled)
    .map((setting) => {
      const catalogField = getSheetFieldById(setting.fieldId)
      if (!catalogField) return null

      if (catalogField.type === 'select' || catalogField.type === 'multiselect') {
        const options =
          setting.selectedOptions.length > 0
            ? setting.selectedOptions
            : (catalogField.options ?? [])

        return { ...catalogField, options }
      }

      return { ...catalogField }
    })
    .filter((field): field is CampaignFormField => field !== null)
}

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Текст',
  textarea: 'Текстовая область',
  select: 'Выпадающий список',
  multiselect: 'Список (несколько)',
  file: 'Файл',
}

export function toggleQuestionnaireOption(
  settings: QuestionnaireFieldSetting[],
  fieldId: string,
  option: string,
): QuestionnaireFieldSetting[] {
  return settings.map((setting) => {
    if (setting.fieldId !== fieldId) return setting

    const selected = setting.selectedOptions.includes(option)
      ? setting.selectedOptions.filter((item) => item !== option)
      : [...setting.selectedOptions, option]

    return { ...setting, selectedOptions: selected }
  })
}

export function setQuestionnaireFieldEnabled(
  settings: QuestionnaireFieldSetting[],
  fieldId: string,
  enabled: boolean,
): QuestionnaireFieldSetting[] {
  return settings.map((setting) =>
    setting.fieldId === fieldId ? { ...setting, enabled } : setting,
  )
}
