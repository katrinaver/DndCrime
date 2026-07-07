import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCampaigns } from '../modules/campaigns/CampaignContext'
import type { Campaign, CampaignStatus } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

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
  const { user } = useAuth()
  const { campaigns, userCampaignIds, loading, error } = useCampaigns()
  const leaveCampaign = useCampaignStore((s) => s.leaveCampaign)
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign)

  const [actionError, setActionError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const myCampaigns = campaigns.filter((campaign) => userCampaignIds.includes(campaign.id))

  function openCampaign(campaignId: string) {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (campaign && user?.id === campaign.masterId) {
      navigate(`/campaigns/${campaignId}/master`)
      return
    }
    navigate(`/campaigns/${campaignId}/menu`)
  }

  async function handleLeave(campaign: Campaign, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Выйти из кампании «${campaign.name}»?`)) return

    setActingId(campaign.id)
    setActionError(null)
    try {
      await leaveCampaign(campaign.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось выйти из кампании')
    } finally {
      setActingId(null)
    }
  }

  async function handleDelete(campaign: Campaign, e: React.MouseEvent) {
    e.stopPropagation()
    if (
      !window.confirm(
        `Удалить кампанию «${campaign.name}»? Это действие нельзя отменить.`,
      )
    ) {
      return
    }

    setActingId(campaign.id)
    setActionError(null)
    try {
      await deleteCampaign(campaign.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось удалить кампанию')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Мои кампании</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            {loading
              ? 'Загрузка…'
              : `${myCampaigns.length} ${myCampaigns.length === 1 ? 'кампания' : 'кампаний'}`}
          </p>
        </div>
        <Button className="!w-auto" onClick={() => navigate('/campaigns/new')}>
          Создать новую кампанию
        </Button>
      </div>

      {(error || actionError) && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {actionError ?? error}
        </p>
      )}

      {!loading && myCampaigns.length === 0 ? (
        <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center text-sm text-dnd-muted">
          Кампаний пока нет. Создайте новую или дождитесь приглашения от мастера.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-dnd-border bg-dnd-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-dnd-border bg-dnd-dark/50">
                  <th className="px-6 py-3 font-medium text-dnd-muted">Название</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Мастер</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Игроки</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Уровень</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Последняя сессия</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Статус</th>
                  <th className="px-6 py-3 font-medium text-dnd-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {myCampaigns.map((campaign) => {
                  const isMaster = user?.id === campaign.masterId
                  const isActing = actingId === campaign.id

                  return (
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
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {isMaster ? (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={(e) => void handleDelete(campaign, e)}
                            className="text-xs text-red-400 transition hover:text-red-300 disabled:opacity-50"
                          >
                            {isActing ? 'Удаление…' : 'Удалить'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={(e) => void handleLeave(campaign, e)}
                            className="text-xs text-dnd-muted transition hover:text-white disabled:opacity-50"
                          >
                            {isActing ? 'Выход…' : 'Выйти'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
