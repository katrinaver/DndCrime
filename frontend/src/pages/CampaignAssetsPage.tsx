import { useOutletContext } from 'react-router-dom'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'

export interface CampaignAsset {
  id: string
  title: string
  type: 'map' | 'handout' | 'note' | 'link'
  description: string
}

const assetTypeLabels: Record<CampaignAsset['type'], string> = {
  map: 'Карта',
  handout: 'Раздатка',
  note: 'Заметка',
  link: 'Ссылка',
}

const assetTypeStyles: Record<CampaignAsset['type'], string> = {
  map: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  handout: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  note: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  link: 'border-dnd-purple/30 bg-dnd-purple/10 text-dnd-purple-hover',
}

export function CampaignAssetsPage() {
  const { campaign: _campaign } = useOutletContext<CampaignRoomContext>()
  const assets: CampaignAsset[] = []

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
      <h3 className="text-lg font-semibold text-white">Ассеты кампании</h3>
      <p className="mt-1 text-sm text-dnd-muted">
        Карты, раздатки и материалы от мастера
      </p>

      {assets.length === 0 ? (
        <p className="mt-6 text-sm text-dnd-muted">
          Материалы пока не добавлены. API для ассетов будет подключён позже.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="rounded-lg border border-dnd-border bg-dnd-dark/50 p-4 transition hover:border-dnd-purple/40"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-white">{asset.title}</h4>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase ${assetTypeStyles[asset.type]}`}
                >
                  {assetTypeLabels[asset.type]}
                </span>
              </div>
              <p className="mt-2 text-sm text-dnd-muted">{asset.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
