import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
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

export function CampaignsPage() {
  const navigate = useNavigate()
  const { campaigns, userCampaignIds } = useCampaigns()

  const myCampaigns = campaigns.filter((campaign) => userCampaignIds.includes(campaign.id))

  function openCampaign(campaignId: string) {
    navigate(`/campaigns/${campaignId}/menu`)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Мои кампании</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            {myCampaigns.length} {myCampaigns.length === 1 ? 'кампания' : 'кампаний'}
          </p>
        </div>
        <Button className="!w-auto" onClick={() => navigate('/campaigns/new')}>
          Создать новую кампанию
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-dnd-border bg-dnd-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-dnd-border bg-dnd-dark/50">
                <th className="px-6 py-3 font-medium text-dnd-muted">Название</th>
                <th className="px-6 py-3 font-medium text-dnd-muted">Мастер</th>
                <th className="px-6 py-3 font-medium text-dnd-muted">Игроки</th>
                <th className="px-6 py-3 font-medium text-dnd-muted">Уровень</th>
                <th className="px-6 py-3 font-medium text-dnd-muted">Последняя сессия</th>
                <th className="px-6 py-3 font-medium text-dnd-muted">Статус</th>
              </tr>
            </thead>
            <tbody>
              {myCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  onClick={() => openCampaign(campaign.id)}
                  className="cursor-pointer border-b border-dnd-border/60 transition last:border-0 hover:bg-dnd-dark/30"
                >
                  <td className="px-6 py-4 font-medium text-white">{campaign.name}</td>
                  <td className="px-6 py-4 text-gray-300">{campaign.master}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {campaign.players}/{campaign.maxPlayers}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{campaign.level} ур.</td>
                  <td className="px-6 py-4 text-gray-300">{campaign.lastSession ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
                    >
                      {statusLabels[campaign.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
