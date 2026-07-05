import { getSheetFieldById, SHEET_FIELD_CATALOG } from '../characters/sheetFieldCatalog'
import type { QuestionnaireFieldSetting } from './types'
import {
  FIELD_TYPE_LABELS,
  setQuestionnaireFieldEnabled,
  toggleQuestionnaireOption,
} from './questionnaireUtils'

interface QuestionnaireBuilderProps {
  settings: QuestionnaireFieldSetting[]
  onChange: (settings: QuestionnaireFieldSetting[]) => void
}

export function QuestionnaireBuilder({ settings, onChange }: QuestionnaireBuilderProps) {
  let lastSection: string | undefined

  function handleToggle(fieldId: string, enabled: boolean) {
    onChange(setQuestionnaireFieldEnabled(settings, fieldId, enabled))
  }

  function handleToggleOption(fieldId: string, option: string) {
    onChange(toggleQuestionnaireOption(settings, fieldId, option))
  }

  const enabledCount = settings.filter((setting) => setting.enabled).length

  return (
    <div className="rounded-xl border border-dnd-purple/30 bg-dnd-card p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Анкета персонажа</h3>
          <p className="mt-1 text-sm text-dnd-muted">
            Выберите поля листа D&amp;D 2024 и настройте варианты в выпадающих списках
          </p>
        </div>
        <span className="rounded-full border border-dnd-purple/40 bg-dnd-purple/10 px-3 py-1 text-xs text-dnd-purple-hover">
          {enabledCount} полей включено
        </span>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => {
          const field = getSheetFieldById(setting.fieldId)
          if (!field) return null

          const showSection = field.section && field.section !== lastSection
          if (showSection) lastSection = field.section

          const hasOptions =
            (field.type === 'select' || field.type === 'multiselect') &&
            (field.options?.length ?? 0) > 0

          return (
            <div key={setting.fieldId}>
              {showSection && (
                <h4 className="mb-3 mt-2 border-t border-dnd-border pt-4 text-xs font-semibold uppercase tracking-wide text-dnd-muted first:mt-0 first:border-t-0 first:pt-0">
                  {field.section}
                </h4>
              )}

              <div
                className={`rounded-lg border p-4 transition ${
                  setting.enabled
                    ? 'border-dnd-purple/40 bg-dnd-dark/40'
                    : 'border-dnd-border bg-dnd-dark/20 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={(e) => handleToggle(setting.fieldId, e.target.checked)}
                      className="h-4 w-4 rounded border-dnd-border bg-dnd-dark text-dnd-purple focus:ring-dnd-purple"
                    />
                    <span className="text-sm font-medium text-white">{field.label}</span>
                  </label>
                  <span className="rounded-md border border-dnd-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-dnd-muted">
                    {FIELD_TYPE_LABELS[field.type] ?? field.type}
                  </span>
                </div>

                {setting.enabled && hasOptions && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-dnd-muted">
                      Варианты в {field.type === 'multiselect' ? 'списке' : 'выпадающем списке'}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {field.options!.map((option) => {
                        const isSelected = setting.selectedOptions.includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleToggleOption(setting.fieldId, option)}
                            className={`rounded-md border px-2.5 py-1 text-xs transition ${
                              isSelected
                                ? 'border-dnd-gold bg-dnd-gold/15 text-dnd-gold'
                                : 'border-dnd-border text-dnd-muted hover:border-dnd-gold/50'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {setting.enabled && !hasOptions && (
                  <p className="mt-2 text-xs text-dnd-muted">
                    {field.type === 'file'
                      ? 'Игрок загрузит файл самостоятельно'
                      : 'Свободный ввод текста'}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {enabledCount === 0 && (
        <p className="mt-4 text-sm text-amber-400">
          Включите хотя бы одно поле — иначе анкета персонажа будет пустой.
        </p>
      )}
    </div>
  )
}

export { SHEET_FIELD_CATALOG }
