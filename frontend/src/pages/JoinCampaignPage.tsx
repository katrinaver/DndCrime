import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { fetchInvitePreview } from '../api/campaigns'
import { ApiError } from '../lib/apiClient'
import type { CampaignInvitePreview } from '../modules/campaigns/types'
import { useCampaignStore } from '../store/campaignStore'

export function JoinCampaignPage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const joinCampaignByInvite = useCampaignStore((s) => s.joinCampaignByInvite)

  const [invite, setInvite] = useState<CampaignInvitePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetchInvitePreview(token)
      .then((data) => {
        if (!cancelled) setInvite(data)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? 'Приглашение не найдено — возможно, мастер сбросил ссылку'
            : 'Не удалось загрузить приглашение, попробуйте обновить страницу',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleJoin() {
    setJoining(true)
    setJoinError(null)
    try {
      const campaign = await joinCampaignByInvite(token)
      navigate(`/campaigns/${campaign.id}/menu`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setJoinError('Не получилось присоединиться: в кампании нет мест или набор закрыт')
      } else if (err instanceof ApiError && err.status === 404) {
        setJoinError('Приглашение больше не действует — попросите у мастера новую ссылку')
      } else {
        setJoinError('Не удалось присоединиться, попробуйте ещё раз')
      }
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dnd-gold border-t-transparent" />
      </div>
    )
  }

  if (loadError || !invite) {
    return (
      <AuthLayout title="Приглашение в кампанию">
        <p className="text-sm text-dnd-muted">{loadError ?? 'Приглашение недоступно'}</p>
        <Link
          to="/home"
          className="mt-6 inline-block text-sm text-dnd-gold transition hover:underline"
        >
          На главную
        </Link>
      </AuthLayout>
    )
  }

  const isFull = invite.players >= invite.maxPlayers
  const statusNotice =
    invite.status === 'paused'
      ? 'Кампания на паузе и сейчас не принимает игроков'
      : invite.status === 'completed'
        ? 'Кампания уже завершена'
        : isFull
          ? 'В кампании не осталось свободных мест'
          : null

  return (
    <AuthLayout
      title={invite.name}
      subtitle={`${invite.master.name} приглашает вас в кампанию`}
    >
      <dl className="space-y-3 text-sm">
        {invite.setting && (
          <div>
            <dt className="text-dnd-muted">Сеттинг</dt>
            <dd className="mt-0.5 text-white">{invite.setting}</dd>
          </div>
        )}
        {invite.level && (
          <div>
            <dt className="text-dnd-muted">Уровень</dt>
            <dd className="mt-0.5 text-white">{invite.level}</dd>
          </div>
        )}
        <div>
          <dt className="text-dnd-muted">Участники</dt>
          <dd className="mt-0.5 text-white">
            {invite.players} из {invite.maxPlayers}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        {invite.isMember ? (
          <>
            <p className="mb-4 text-sm text-dnd-muted">Вы уже участвуете в этой кампании</p>
            <Button
              type="button"
              onClick={() => navigate(`/campaigns/${invite.campaignId}/menu`)}
            >
              Открыть кампанию
            </Button>
          </>
        ) : statusNotice ? (
          <>
            <p className="mb-4 text-sm text-dnd-muted">{statusNotice}</p>
            <Link
              to="/home"
              className="inline-block text-sm text-dnd-gold transition hover:underline"
            >
              На главную
            </Link>
          </>
        ) : (
          <>
            <Button type="button" loading={joining} onClick={() => void handleJoin()}>
              Присоединиться
            </Button>
            {joinError && <p className="mt-3 text-sm text-red-400">{joinError}</p>}
          </>
        )}
      </div>
    </AuthLayout>
  )
}
