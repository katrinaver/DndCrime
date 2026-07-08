import { NavLink, Outlet, Navigate, useParams } from 'react-router-dom'
import { BackLink } from '../../components/BackLink'
import { useAuth } from '../../context/AuthContext'
import { CampaignMasterInvitationBanner } from './CampaignMasterInvitationBanner'
import { useCampaigns } from './CampaignContext'
import { isCampaignMaster } from './utils'
import type { Campaign, CampaignStatus } from './types'

export type CampaignMasterContext = {
  campaign: Campaign
}

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

const masterNavItems = [
  { to: 'settings', label: 'Настройки' },
  { to: 'participants', label: 'Игроки' },
  { to: 'chat', label: 'Чат' },
  { to: 'assets', label: 'Ассеты' },
  { to: 'progress', label: 'Прогресс' },
]

function masterNavClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-dnd-gold/15 text-dnd-gold'
      : 'text-dnd-muted hover:bg-dnd-border/50 hover:text-white',
  ].join(' ')
}

export function CampaignMasterLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { user } = useAuth()
  const { campaigns, userCampaignIds, loading } = useCampaigns()

  const campaign = campaigns.find((c) => c.id === campaignId)
  const isMaster = campaign ? isCampaignMaster(campaign, user?.id) : false

  if (loading) {
    return <p className="text-sm text-dnd-muted">Загрузка кампании…</p>
  }

  if (!campaignId || !campaign || !userCampaignIds.includes(campaignId) || !isMaster) {
    return <Navigate to="/campaigns" replace />
  }

  return (
    <div>
      <BackLink to="/campaigns" label="← К списку кампаний" />

      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-dnd-gold">
              Панель мастера
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{campaign.name}</h2>
            <p className="mt-1 text-sm text-dnd-muted">
              {campaign.players}/{campaign.maxPlayers} игроков · {campaign.level} ур.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
          >
            {statusLabels[campaign.status]}
          </span>
        </div>
        <NavLink
          to={`/campaigns/${campaignId}/menu`}
          className="mt-3 inline-block text-sm text-dnd-muted transition hover:text-dnd-gold"
        >
          Комната игрока →
        </NavLink>
      </div>

      <CampaignMasterInvitationBanner campaign={campaign} />

      <nav className="mb-6 flex flex-wrap gap-2 border-b border-dnd-border pb-4">
        {masterNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={`/campaigns/${campaignId}/master/${item.to}`}
            className={masterNavClass}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ campaign }} />
    </div>
  )
}
