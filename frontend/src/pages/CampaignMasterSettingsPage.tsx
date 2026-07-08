import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { AntiAchievementsEditor } from '../modules/campaigns/AntiAchievementsEditor'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'
import { DND_LEVELS } from '../modules/characters/sheetOptions'
import type { CampaignStatus, CampaignUpdateInput } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

const MAX_PLAYER_OPTIONS = ['2', '3', '4', '5', '6', '7', '8']
const STATUS_OPTIONS: CampaignStatus[] = ['active', 'paused', 'completed']

const statusLabels: Record<CampaignStatus, string> = {
  active: 'Активна',
  paused: 'На паузе',
  completed: 'Завершена',
}

function campaignToForm(campaign: CampaignMasterContext['campaign']): CampaignUpdateInput {
  return {
    name: campaign.name,
    place: campaign.place,
    setting: campaign.setting,
    maxPlayers: campaign.maxPlayers,
    level: campaign.level,
    extraParams: campaign.extraParams,
    antiAchievementPool: [...campaign.antiAchievementPool],
    sessionDate: campaign.sessionDate ?? '',
    sessionTime: campaign.sessionTime ?? '',
    lastSession: campaign.lastSession ?? '',
    status: campaign.status,
  }
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-dnd-muted">{label}</dt>
      <dd className="mt-0.5 text-white">{value || '—'}</dd>
    </div>
  )
}

export function CampaignMasterSettingsPage() {
  const navigate = useNavigate()
  const { campaign } = useOutletContext<CampaignMasterContext>()
  const updateCampaign = useCampaignStore((s) => s.updateCampaign)
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign)

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState(() => campaignToForm(campaign))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(campaignToForm(campaign))
  }, [campaign])

  function updateField<K extends keyof CampaignUpdateInput>(key: K, value: CampaignUpdateInput[K]) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit() {
    setForm(campaignToForm(campaign))
    setError(null)
    setSaved(false)
    setMode('edit')
  }

  function cancelEdit() {
    setForm(campaignToForm(campaign))
    setError(null)
    setSaved(false)
    setMode('view')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateCampaign(campaign.id, form)
      setSaved(true)
      setMode('view')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Удалить кампанию «${campaign.name}»? Это действие нельзя отменить.`,
      )
    ) {
      return
    }

    setDeleting(true)
    setError(null)
    try {
      await deleteCampaign(campaign.id)
      navigate('/campaigns', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить кампанию')
    } finally {
      setDeleting(false)
    }
  }

  const sessionLabel =
    form.sessionDate && `${form.sessionDate}${form.sessionTime ? ` · ${form.sessionTime}` : ''}`

  if (mode === 'view') {
    return (
      <div className="space-y-6">
        {saved && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            Настройки сохранены
          </p>
        )}

        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
              Настройки кампании
            </h3>
            <Button type="button" variant="secondary" className="!w-auto px-4" onClick={startEdit}>
              Редактировать
            </Button>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ViewField label="Название" value={form.name} />
            </div>
            <ViewField label="Статус" value={statusLabels[form.status]} />
            <ViewField label="Последняя сессия" value={form.lastSession} />
            <ViewField label="Ближайшая сессия" value={sessionLabel || ''} />
            <ViewField label="Место / платформа" value={form.place} />
            <div className="sm:col-span-2">
              <ViewField label="Сеттинг" value={form.setting} />
            </div>
            <ViewField label="Максимум игроков" value={String(form.maxPlayers)} />
            <ViewField label="Уровень персонажей" value={`${form.level} ур.`} />
            <div className="sm:col-span-2">
              <ViewField label="Дополнительные параметры" value={form.extraParams} />
            </div>
            <div className="sm:col-span-2">
              <dt className="text-dnd-muted">Пул антидостижений</dt>
              {form.antiAchievementPool.length === 0 ? (
                <dd className="mt-0.5 text-white">—</dd>
              ) : (
                <dd className="mt-2 flex flex-wrap gap-2">
                  {form.antiAchievementPool.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              )}
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-400">
            Опасная зона
          </h3>
          <p className="mt-2 text-sm text-dnd-muted">
            Удаление кампании необратимо. Все данные кампании, включая персонажей, ассеты и
            прогресс, будут удалены.
          </p>
          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="!mt-4 !w-auto border-red-500/30 text-red-400 hover:border-red-400 hover:text-red-300"
            loading={deleting}
            onClick={() => void handleDelete()}
          >
            Удалить кампанию
          </Button>
        </section>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Редактирование настроек</h3>
          <p className="mt-1 text-sm text-dnd-muted">Измените параметры и сохраните</p>
        </div>
        <Button type="button" variant="ghost" className="!w-auto" onClick={cancelEdit}>
          Отмена
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Основное
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
              Название кампании
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-300">
              Статус
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as CampaignStatus)}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lastSession" className="mb-1.5 block text-sm font-medium text-gray-300">
              Последняя сессия
            </label>
            <input
              id="lastSession"
              value={form.lastSession}
              onChange={(e) => updateField('lastSession', e.target.value)}
              placeholder="28.06.2026"
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div>
            <label htmlFor="sessionDate" className="mb-1.5 block text-sm font-medium text-gray-300">
              Дата ближайшей сессии
            </label>
            <input
              id="sessionDate"
              type="date"
              value={form.sessionDate}
              onChange={(e) => updateField('sessionDate', e.target.value)}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div>
            <label htmlFor="sessionTime" className="mb-1.5 block text-sm font-medium text-gray-300">
              Время сессии
            </label>
            <input
              id="sessionTime"
              type="time"
              value={form.sessionTime}
              onChange={(e) => updateField('sessionTime', e.target.value)}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div>
            <label htmlFor="place" className="mb-1.5 block text-sm font-medium text-gray-300">
              Место / платформа
            </label>
            <input
              id="place"
              value={form.place}
              onChange={(e) => updateField('place', e.target.value)}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="setting" className="mb-1.5 block text-sm font-medium text-gray-300">
              Сеттинг
            </label>
            <textarea
              id="setting"
              value={form.setting}
              onChange={(e) => updateField('setting', e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div>
            <label htmlFor="maxPlayers" className="mb-1.5 block text-sm font-medium text-gray-300">
              Максимум игроков
            </label>
            <select
              id="maxPlayers"
              value={String(form.maxPlayers)}
              onChange={(e) => updateField('maxPlayers', Number(e.target.value))}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            >
              {MAX_PLAYER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-gray-300">
              Уровень персонажей
            </label>
            <select
              id="level"
              value={form.level}
              onChange={(e) => updateField('level', e.target.value)}
              className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            >
              {DND_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="extraParams" className="mb-1.5 block text-sm font-medium text-gray-300">
              Дополнительные параметры
            </label>
            <textarea
              id="extraParams"
              value={form.extraParams}
              onChange={(e) => updateField('extraParams', e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
            />
          </div>
          <div className="sm:col-span-2">
            <AntiAchievementsEditor
              items={form.antiAchievementPool}
              onChange={(items) => updateField('antiAchievementPool', items)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" className="!w-auto" onClick={cancelEdit}>
          Отмена
        </Button>
        <Button type="submit" className="!w-auto px-6" loading={saving}>
          Сохранить настройки
        </Button>
      </div>
    </form>
  )
}
