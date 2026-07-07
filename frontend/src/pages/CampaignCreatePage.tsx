import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/ui/Button'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import { DND_LEVELS } from '../modules/characters/sheetOptions'
import { QuestionnaireBuilder } from '../modules/campaigns/QuestionnaireBuilder'
import { AntiAchievementsEditor } from '../modules/campaigns/AntiAchievementsEditor'
import { createDefaultQuestionnaireSettings } from '../modules/campaigns/questionnaireUtils'
import type { CampaignCreateInput, QuestionnaireFieldSetting } from '../modules/campaigns/types'

const MAX_PLAYER_OPTIONS = ['2', '3', '4', '5', '6', '7', '8']

const emptyForm = (): CampaignCreateInput => ({
  name: '',
  sessionDate: '',
  sessionTime: '',
  place: '',
  setting: '',
  maxPlayers: '4',
  level: '1',
  extraParams: '',
})

function FormInput({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
      />
    </div>
  )
}

function FormSelect({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CampaignCreatePage() {
  const navigate = useNavigate()
  const { createCampaign } = useCampaigns()

  const [form, setForm] = useState(emptyForm)
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false)
  const [questionnaireSettings, setQuestionnaireSettings] = useState<QuestionnaireFieldSetting[]>(
    createDefaultQuestionnaireSettings,
  )
  const [antiAchievementPool, setAntiAchievementPool] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateForm<K extends keyof CampaignCreateInput>(key: K, value: CampaignCreateInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createCampaign(form, questionnaireSettings, antiAchievementPool)
      navigate('/campaigns')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать кампанию')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <BackLink to="/campaigns" label="← К списку кампаний" />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">Создание кампании</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Заполните параметры кампании и настройте анкету для персонажей
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Основное
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="name"
              label="Название кампании"
              value={form.name}
              onChange={(v) => updateForm('name', v)}
              placeholder="Например: Проклятие Страда"
              required
            />
            <FormInput
              id="sessionDate"
              label="Дата ближайшей сессии"
              type="date"
              value={form.sessionDate}
              onChange={(v) => updateForm('sessionDate', v)}
            />
            <FormInput
              id="sessionTime"
              label="Время сессии"
              type="time"
              value={form.sessionTime}
              onChange={(v) => updateForm('sessionTime', v)}
            />
            <FormInput
              id="place"
              label="Место / платформа"
              value={form.place}
              onChange={(v) => updateForm('place', v)}
              placeholder="Онлайн, офлайн, адрес встречи..."
            />
            <div className="sm:col-span-2">
              <label
                htmlFor="setting"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Сеттинг
              </label>
              <textarea
                id="setting"
                value={form.setting}
                onChange={(e) => updateForm('setting', e.target.value)}
                placeholder="Опишите мир, тон и особенности кампании..."
                rows={3}
                className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
              />
            </div>
            <FormSelect
              id="maxPlayers"
              label="Максимум игроков"
              value={form.maxPlayers}
              onChange={(v) => updateForm('maxPlayers', v)}
              options={MAX_PLAYER_OPTIONS}
            />
            <FormSelect
              id="level"
              label="Уровень персонажей"
              value={form.level}
              onChange={(v) => updateForm('level', v)}
              options={DND_LEVELS}
            />
            <div className="sm:col-span-2">
              <label
                htmlFor="extraParams"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Дополнительные параметры
              </label>
              <textarea
                id="extraParams"
                value={form.extraParams}
                onChange={(e) => updateForm('extraParams', e.target.value)}
                placeholder="Частота сессий, длительность, возрастной рейтинг, табу..."
                rows={3}
                className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
              />
            </div>
            <div className="sm:col-span-2">
              <AntiAchievementsEditor items={antiAchievementPool} onChange={setAntiAchievementPool} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Анкета персонажей</h3>
              <p className="mt-1 text-sm text-dnd-muted">
                Кастомная форма на базе полей листа D&amp;D 2024
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="!w-auto"
              onClick={() => setQuestionnaireOpen((open) => !open)}
            >
              {questionnaireOpen ? 'Скрыть настройку' : 'Настроить анкету'}
            </Button>
          </div>

          {questionnaireOpen && (
            <div className="mt-4">
              <QuestionnaireBuilder
                settings={questionnaireSettings}
                onChange={setQuestionnaireSettings}
              />
            </div>
          )}
        </section>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            className="!w-auto"
            onClick={() => navigate('/campaigns')}
          >
            Отмена
          </Button>
          <Button type="submit" className="!w-auto px-6" loading={submitting}>
            Создать кампанию
          </Button>
        </div>
      </form>
    </div>
  )
}
