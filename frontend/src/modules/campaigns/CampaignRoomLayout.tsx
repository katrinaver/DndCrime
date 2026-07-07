import { useEffect } from 'react'
import { NavLink, Outlet, Navigate, useParams } from 'react-router-dom'
import { BackLink } from '../../components/BackLink'
import { useAuth } from '../../context/AuthContext'
import { useCharacterStore } from '../../store/characterStore'
import { useCampaigns } from './CampaignContext'
import type { CampaignStatus } from './types'
import type { Campaign } from './types'
import type { CharacterSheet } from '../characters/types'

export type CampaignRoomContext = {
  campaign: Campaign
  character: CharacterSheet | undefined
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

const roomNavItems = [
  { to: 'menu', label: 'Меню' },
  { to: 'chat', label: 'Чат' },
  { to: 'assets', label: 'Ассеты' },
  { to: 'progress', label: 'Прогресс' },
  { to: 'achievements', label: 'Ачивки' },
]

function roomNavClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-dnd-purple/20 text-dnd-purple-hover'
      : 'text-dnd-muted hover:bg-dnd-border/50 hover:text-white',
  ].join(' ')
}

export function CampaignRoomLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { user } = useAuth()
  const { campaigns, userCampaignIds } = useCampaigns()
  const getCharacterByCampaignId = useCharacterStore((s) => s.getCharacterByCampaignId)
  const fetchCharacters = useCharacterStore((s) => s.fetchCharacters)

  const campaign = campaigns.find((c) => c.id === campaignId)
  const character = campaignId ? getCharacterByCampaignId(campaignId) : undefined
  const isMaster = campaign && user?.id === campaign.masterId

  useEffect(() => {
    void fetchCharacters()
  }, [fetchCharacters])

  if (!campaignId || !campaign || !userCampaignIds.includes(campaignId)) {
    return <Navigate to="/campaigns" replace />
  }

  return (
    <div>
      <BackLink to="/campaigns" label="← К списку кампаний" />

      <div className="mt-4 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{campaign.name}</h2>
            <p className="mt-1 text-sm text-dnd-muted">
              Мастер: {campaign.master} · {campaign.level} ур. · {campaign.players}/
              {campaign.maxPlayers} игроков
            </p>
          </div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[campaign.status]}`}
          >
            {statusLabels[campaign.status]}
          </span>
        </div>

        {isMaster && (
          <NavLink
            to={`/campaigns/${campaignId}/master`}
            className="mt-3 inline-block text-sm text-dnd-gold hover:underline"
          >
            Открыть панель мастера →
          </NavLink>
        )}

        {character ? (
          <div className="mt-4 rounded-xl border border-dnd-gold/30 bg-dnd-gold/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-dnd-gold">
              Ваш персонаж
            </p>
            <p className="mt-1 font-medium text-white">{character.name}</p>
            <p className="text-sm text-dnd-muted">
              {character.species} · {character.className} {character.level} ур.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dnd-border bg-dnd-card p-4 text-sm text-dnd-muted">
            У вас пока нет персонажа в этой кампании.{' '}
            <NavLink
              to={`/characters/new/campaign/${campaignId}`}
              className="text-dnd-gold hover:underline"
            >
              Создать персонажа
            </NavLink>
          </div>
        )}
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 border-b border-dnd-border pb-4">
        {roomNavItems.map((item) => (
          <NavLink key={item.to} to={`/campaigns/${campaignId}/${item.to}`} className={roomNavClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ campaign, character }} />
    </div>
  )
}
