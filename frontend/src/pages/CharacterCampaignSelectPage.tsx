import { Link } from 'react-router-dom'
import { BackLink } from '../components/BackLink'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import type { CampaignStatus } from '../modules/campaigns/types'

const statusLabels: Record<CampaignStatus, string> = {
  active: 'Активна',
  paused: 'На паузе',
  completed: 'Завершена',
}

const statusStyles: Record<CampaignStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  completed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
}

export function CharacterCampaignSelectPage() {
  const { campaigns, userCampaignIds } = useCampaigns()
  const availableCampaigns = campaigns.filter(
    (campaign) =>
      userCampaignIds.includes(campaign.id) && campaign.status !== 'completed',
  )

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white">Выбор кампании</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Выберите кампанию — откроется кастомная анкета мастера
        </p>
      </div>

      {availableCampaigns.length === 0 ? (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-6 text-sm text-dnd-muted">
          Нет доступных кампаний. Попросите мастера добавить вас или создайте свою.
        </div>
      ) : (
        <div className="space-y-3">
          {availableCampaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/characters/new/campaign/${campaign.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-dnd-border bg-dnd-card p-4 transition hover:border-dnd-purple/50 hover:bg-dnd-dark/30"
            >
              <div>
                <h3 className="font-semibold text-white">{campaign.name}</h3>
                <p className="mt-1 text-sm text-dnd-muted">
                  Мастер: {campaign.master} · {campaign.level} ур.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
              >
                {statusLabels[campaign.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
