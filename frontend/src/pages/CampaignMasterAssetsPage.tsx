import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { uploadFile } from '../api/uploads'
import { Button } from '../components/ui/Button'
import {
  assetActionLabel,
  assetTypeLabels,
  assetTypeStyles,
  inferAssetType,
} from '../modules/campaigns/assetUtils'
import type { CampaignMasterContext } from '../modules/campaigns/CampaignMasterLayout'
import type { CampaignAsset, CampaignAssetType } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

const emptyAsset = (): Pick<CampaignAsset, 'title' | 'type' | 'description' | 'url'> => ({
  title: '',
  type: 'note',
  description: '',
  url: '',
})

export function CampaignMasterAssetsPage() {
  const { campaign } = useOutletContext<CampaignMasterContext>()
  const assets = useCampaignStore((s) => s.getCampaignAssets(campaign.id))
  const fetchCampaignAssets = useCampaignStore((s) => s.fetchCampaignAssets)
  const createCampaignAsset = useCampaignStore((s) => s.createCampaignAsset)
  const updateCampaignAsset = useCampaignStore((s) => s.updateCampaignAsset)
  const deleteCampaignAsset = useCampaignStore((s) => s.deleteCampaignAsset)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyAsset)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void fetchCampaignAssets(campaign.id)
  }, [campaign.id, fetchCampaignAssets])

  function openCreate() {
    setEditingId(null)
    setForm(emptyAsset())
    setFormOpen(true)
    setError(null)
  }

  function openEdit(asset: CampaignAsset) {
    setEditingId(asset.id)
    setForm({
      title: asset.title,
      type: asset.type,
      description: asset.description,
      url: asset.url ?? '',
    })
    setFormOpen(true)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await updateCampaignAsset(campaign.id, editingId, form)
      } else {
        await createCampaignAsset(campaign.id, form)
      }
      setFormOpen(false)
      setForm(emptyAsset())
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить ассет')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(assetId: string) {
    if (!window.confirm('Удалить этот ассет?')) return
    try {
      await deleteCampaignAsset(campaign.id, assetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить ассет')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadFile(file, 'campaign-asset')
        await createCampaignAsset(campaign.id, {
          title: file.name,
          type: inferAssetType(file),
          description: '',
          url: uploaded.url,
        })
      }
      await fetchCampaignAssets(campaign.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Ассеты кампании</h3>
          <p className="mt-1 text-sm text-dnd-muted">Карты, раздатки и файлы для игроков</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleFileUpload(e)}
          />
          <Button
            type="button"
            variant="secondary"
            className="!w-auto"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Загрузить файл
          </Button>
          <Button type="button" className="!w-auto" onClick={openCreate}>
            Добавить ассет
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-xl border border-dnd-gold/30 bg-dnd-card p-6"
        >
          <h4 className="font-medium text-white">
            {editingId ? 'Редактировать ассет' : 'Новый ассет'}
          </h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-gray-300">Название</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">Тип</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as CampaignAssetType }))
                }
                className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
              >
                {(Object.keys(assetTypeLabels) as CampaignAssetType[]).map((type) => (
                  <option key={type} value={type}>
                    {assetTypeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">Ссылка / URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-gray-300">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-sm text-white outline-none focus:border-dnd-purple"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              className="!w-auto"
              onClick={() => setFormOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" className="!w-auto px-5" loading={saving}>
              Сохранить
            </Button>
          </div>
        </form>
      )}

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center text-sm text-dnd-muted">
          Ассеты пока не добавлены. Загрузите файлы или создайте ассет вручную.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="rounded-xl border border-dnd-border bg-dnd-card p-4 transition hover:border-dnd-purple/40"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-white">{asset.title}</h4>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase ${assetTypeStyles[asset.type]}`}
                >
                  {assetTypeLabels[asset.type]}
                </span>
              </div>
              {asset.description && (
                <p className="mt-2 text-sm text-dnd-muted">{asset.description}</p>
              )}
              {asset.url && (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={asset.type === 'file' ? asset.title : undefined}
                  className="mt-2 inline-block text-sm text-dnd-gold hover:underline"
                >
                  {assetActionLabel(asset.type)} →
                </a>
              )}
              <div className="mt-4 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => openEdit(asset)}
                  className="text-dnd-muted transition hover:text-white"
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(asset.id)}
                  className="text-dnd-muted transition hover:text-red-400"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
