import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { fetchCampaignInviteLink, resetCampaignInviteLink } from '../../api/campaigns'
import type { Campaign } from './types'
import { useCampaignStore } from '../../store/campaignStore'
import { useNewsStore } from '../../store/newsStore'

interface CampaignMasterInvitationBannerProps {
  campaign: Campaign
}

export function CampaignMasterInvitationBanner({ campaign }: CampaignMasterInvitationBannerProps) {
  const publishCampaignInvitation = useCampaignStore((s) => s.publishCampaignInvitation)
  const prependPost = useNewsStore((s) => s.prependPost)

  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(Boolean(campaign.invitationPostId))
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [linkNotice, setLinkNotice] = useState<string | null>(null)

  useEffect(() => {
    setPublished(Boolean(campaign.invitationPostId))
  }, [campaign.invitationPostId])

  useEffect(() => {
    let cancelled = false
    fetchCampaignInviteLink(campaign.id)
      .then(({ token }) => {
        if (!cancelled) setInviteToken(token)
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось получить ссылку-приглашение')
      })
    return () => {
      cancelled = true
    }
  }, [campaign.id])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopyLink() {
    if (!inviteToken) return
    setError(null)
    setLinkNotice(null)
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/join/${inviteToken}`)
      setCopied(true)
    } catch {
      setError('Не удалось скопировать ссылку — скопируйте адрес вручную')
    }
  }

  async function handleResetLink() {
    setResetting(true)
    setError(null)
    setLinkNotice(null)
    try {
      const { token } = await resetCampaignInviteLink(campaign.id)
      setInviteToken(token)
      setLinkNotice('Ссылка обновлена — разосланные ранее ссылки больше не действуют')
    } catch {
      setError('Не удалось сбросить ссылку, попробуйте ещё раз')
    } finally {
      setResetting(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    setError(null)
    try {
      const result = await publishCampaignInvitation(campaign.id)
      prependPost(result.post)
      setPublished(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось опубликовать приглашение')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-dnd-gold/30 bg-dnd-gold/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Пригласить игроков</p>
          <p className="mt-1 text-xs text-dnd-muted">
            Отправьте игрокам ссылку — по ней можно присоединиться к кампании
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="!w-auto px-5"
            disabled={!inviteToken}
            onClick={() => void handleCopyLink()}
          >
            {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
          </Button>
          <button
            type="button"
            disabled={resetting || !inviteToken}
            onClick={() => void handleResetLink()}
            className="rounded-lg px-3 py-2 text-xs text-dnd-muted transition hover:text-white disabled:opacity-50"
            title="Старые ссылки перестанут действовать"
          >
            Сбросить ссылку
          </button>
        </div>
      </div>
      {linkNotice && <p className="mt-3 text-xs text-dnd-gold">{linkNotice}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-dnd-gold/20 pt-4">
        <div>
          <p className="text-sm font-medium text-white">Приглашение в новостях</p>
          <p className="mt-1 text-xs text-dnd-muted">
            {published
              ? 'Игроки могут присоединиться к кампании из ленты новостей'
              : 'Опубликуйте описание кампании с кнопкой «Присоединиться»'}
          </p>
        </div>
        {published ? (
          <Link
            to="/news"
            className="inline-flex items-center rounded-lg border border-dnd-gold/40 bg-dnd-gold/10 px-4 py-2 text-sm font-medium text-dnd-gold transition hover:bg-dnd-gold/20"
          >
            Открыть в новостях
          </Link>
        ) : (
          <Button
            type="button"
            className="!w-auto px-5"
            loading={publishing}
            onClick={() => void handlePublish()}
          >
            Опубликовать приглашение в новостях
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  )
}
