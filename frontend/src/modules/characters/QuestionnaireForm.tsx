import { useState } from 'react'
import { uploadFile } from '../../api/uploads'
import { fileLabelFromUrl, isProbablyImageUrl } from '../../lib/media'
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const baseClass =
    'w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple disabled:opacity-70'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError(null)
    setUploading(true)
    try {
      const { url } = await uploadFile(file, field.id === 'avatar' ? 'avatar' : 'attachment')
      onChange?.(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

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
    const isImage = isProbablyImageUrl(value)

    if (readOnly) {
      return (
        <div className="text-sm text-dnd-muted">
          {isImage ? (
            <img src={value} alt={field.label} className="h-24 w-24 rounded-lg object-cover" />
          ) : value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-dnd-gold hover:underline">
              {fileLabelFromUrl(value)}
            </a>
          ) : (
            'Файл не загружен'
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {isImage ? (
          <img src={value} alt={field.label} className="h-24 w-24 rounded-lg object-cover" />
        ) : value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-dnd-gold hover:underline">
            {fileLabelFromUrl(value)}
          </a>
        ) : null}
        <input
          type="file"
          accept={field.id === 'avatar' ? 'image/*' : undefined}
          disabled={uploading}
          onChange={(e) => void handleFileChange(e)}
          className="block w-full text-sm text-dnd-muted file:mr-3 file:rounded-lg file:border-0 file:bg-dnd-purple/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-dnd-purple hover:file:bg-dnd-purple/30 disabled:opacity-60"
        />
        {uploading && <p className="text-xs text-dnd-muted">Загрузка…</p>}
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
      </div>
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
