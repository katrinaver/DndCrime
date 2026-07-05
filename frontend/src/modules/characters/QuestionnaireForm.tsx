import type { CampaignFormField } from './types'

interface QuestionnaireFormProps {
  title: string
  description?: string
  fields: CampaignFormField[]
  values: Record<string, string>
  readOnly?: boolean
  onChange?: (id: string, value: string) => void
}

const MULTI_VALUE_SEPARATOR = '|'

function parseMultiValue(value: string): string[] {
  return value ? value.split(MULTI_VALUE_SEPARATOR).filter(Boolean) : []
}

function FieldInput({
  field,
  value,
  readOnly,
  onChange,
}: {
  field: CampaignFormField
  value: string
  readOnly?: boolean
  onChange?: (value: string) => void
}) {
  const baseClass =
    'w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple disabled:opacity-70'

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        readOnly={readOnly}
        disabled={readOnly}
        className={`${baseClass} resize-none`}
      />
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className={baseClass}
      >
        <option value="">Выберите...</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'multiselect' && field.options) {
    const selected = parseMultiValue(value)

    function toggleOption(option: string) {
      if (readOnly) return
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
      onChange?.(next.join(MULTI_VALUE_SEPARATOR))
    }

    return (
      <div className="flex flex-wrap gap-2">
        {field.options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition ${
                isSelected
                  ? 'border-dnd-purple bg-dnd-purple/20 text-white'
                  : 'border-dnd-border text-dnd-muted hover:border-dnd-purple/50'
              } ${readOnly ? 'cursor-default opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOption(option)}
                disabled={readOnly}
                className="sr-only"
              />
              {option}
            </label>
          )
        })}
      </div>
    )
  }

  if (field.type === 'file') {
    if (readOnly) {
      return (
        <p className="text-sm text-dnd-muted">
          {value ? `Файл: ${value}` : 'Аватар не загружен'}
        </p>
      )
    }

    return (
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange?.(e.target.files?.[0]?.name ?? '')}
        className="block w-full text-sm text-dnd-muted file:mr-3 file:rounded-lg file:border-0 file:bg-dnd-purple/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-dnd-purple hover:file:bg-dnd-purple/30"
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={field.placeholder}
      readOnly={readOnly}
      disabled={readOnly}
      className={baseClass}
    />
  )
}

export function QuestionnaireForm({
  title,
  description,
  fields,
  values,
  readOnly = false,
  onChange,
}: QuestionnaireFormProps) {
  let lastSection: string | undefined

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-dnd-muted">{description}</p>}

      <div className="mt-6 space-y-4">
        {fields.map((field) => {
          const showSection = field.section && field.section !== lastSection
          if (showSection) lastSection = field.section

          return (
            <div key={field.id}>
              {showSection && (
                <h4 className="mb-3 mt-2 border-t border-dnd-border pt-4 text-xs font-semibold uppercase tracking-wide text-dnd-muted first:mt-0 first:border-t-0 first:pt-0">
                  {field.section}
                </h4>
              )}
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              <FieldInput
                field={field}
                value={values[field.id] ?? ''}
                readOnly={readOnly}
                onChange={(v) => onChange?.(field.id, v)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
