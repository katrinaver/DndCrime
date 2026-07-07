import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CampaignProgressView } from '../modules/campaigns/CampaignProgressView'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'
import type { CampaignMilestone, CampaignProgress } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

function newMilestone(order: number): CampaignMilestone {
  return {
    id: `ms-${Date.now()}-${order}`,
    title: '',
    description: '',
    completed: false,
    order,
  }
}

const emptyProgress = (campaignId: string): CampaignProgress => ({
  campaignId,
  summary: '',
  currentChapter: '',
  milestones: [],
})

export function CampaignMasterProgressPage() {
  const { campaign } = useOutletContext<CampaignMasterContext>()
  const fetchCampaignProgress = useCampaignStore((s) => s.fetchCampaignProgress)
  const saveCampaignProgress = useCampaignStore((s) => s.saveCampaignProgress)
  const cached = useCampaignStore((s) => s.getCampaignProgress(campaign.id))

  const [form, setForm] = useState<CampaignProgress>(() => cached ?? emptyProgress(campaign.id))
  const [loading, setLoading] = useState(!cached)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const progress = await fetchCampaignProgress(campaign.id)
        if (!cancelled) setForm(progress)
      } catch {
        if (!cancelled) setForm(emptyProgress(campaign.id))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [campaign.id, fetchCampaignProgress])

  function updateMilestone(index: number, patch: Partial<CampaignMilestone>) {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }))
  }

  function addMilestone() {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone(prev.milestones.length + 1)],
    }))
  }

  function removeMilestone(index: number) {
    setSaved(false)
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones
        .filter((_, i) => i !== index)
        .map((m, i) => ({ ...m, order: i + 1 })),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const savedProgress = await saveCampaignProgress(campaign.id, {
        summary: form.summary,
        currentChapter: form.currentChapter,
        milestones: form.milestones,
      })
      setForm(savedProgress)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить прогресс')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-dnd-muted">Загрузка прогресса…</p>
  }

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" variant="secondary" className="!w-auto" onClick={() => setPreview(false)}>
            Редактировать
          </Button>
        </div>
        <CampaignProgressView progress={form} />
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Прогресс кампании</h3>
          <p className="mt-1 text-sm text-dnd-muted">
            Этот раздел видят и игроки в комнате кампании
          </p>
        </div>
        <Button type="button" variant="secondary" className="!w-auto" onClick={() => setPreview(true)}>
          Предпросмотр
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Прогресс сохранён
        </p>
      )}

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Текущая глава</label>
          <input
            value={form.currentChapter}
            onChange={(e) => {
              setSaved(false)
              setForm((f) => ({ ...f, currentChapter: e.target.value }))
            }}
            placeholder="Глава 3: Тёмный лес"
            className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Краткое описание прогресса</label>
          <textarea
            value={form.summary}
            onChange={(e) => {
              setSaved(false)
              setForm((f) => ({ ...f, summary: e.target.value }))
            }}
            rows={4}
            placeholder="Что произошло в кампании, куда движется сюжет..."
            className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
          />
        </div>
      </section>

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">Этапы</h4>
          <Button type="button" variant="secondary" className="!w-auto" onClick={addMilestone}>
            Добавить этап
          </Button>
        </div>

        {form.milestones.length === 0 ? (
          <p className="mt-4 text-sm text-dnd-muted">Этапы не заданы</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {form.milestones.map((milestone, index) => (
              <li key={milestone.id} className="rounded-lg border border-dnd-border bg-dnd-dark/40 p-4">
                <div className="flex items-start gap-3">
                  <label className="mt-2 flex items-center gap-2 text-sm text-dnd-muted">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={(e) => updateMilestone(index, { completed: e.target.checked })}
                      className="rounded border-dnd-border"
                    />
                    Выполнено
                  </label>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="ml-auto text-xs text-dnd-muted hover:text-red-400"
                  >
                    Удалить
                  </button>
                </div>
                <input
                  value={milestone.title}
                  onChange={(e) => updateMilestone(index, { title: e.target.value })}
                  placeholder="Название этапа"
                  className="mt-3 w-full rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white outline-none focus:border-dnd-purple"
                />
                <textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, { description: e.target.value })}
                  placeholder="Описание"
                  rows={2}
                  className="mt-2 w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-3 py-2 text-sm text-white outline-none focus:border-dnd-purple"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="!w-auto px-6" loading={saving}>
          Сохранить прогресс
        </Button>
      </div>
    </form>
  )
}
