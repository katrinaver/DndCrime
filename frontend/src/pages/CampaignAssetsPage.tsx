import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  assetActionLabel,
  assetTypeLabels,
  assetTypeStyles,
} from '../modules/campaigns/assetUtils'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'
import { useCampaignStore } from '../store/campaignStore'

export function CampaignAssetsPage() {
  const { campaign } = useOutletContext<CampaignRoomContext>()
  const assets = useCampaignStore((s) => s.getCampaignAssets(campaign.id))
  const fetchCampaignAssets = useCampaignStore((s) => s.fetchCampaignAssets)

  useEffect(() => {
    void fetchCampaignAssets(campaign.id)
  }, [campaign.id, fetchCampaignAssets])

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-6">
      <h3 className="text-lg font-semibold text-white">Ассеты кампании</h3>
      <p className="mt-1 text-sm text-dnd-muted">Карты, раздатки и файлы от мастера</p>

      {assets.length === 0 ? (
        <p className="mt-6 text-sm text-dnd-muted">Материалы пока не добавлены.</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
