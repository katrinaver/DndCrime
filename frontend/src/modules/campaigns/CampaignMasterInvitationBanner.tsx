import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
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

  useEffect(() => {
    setPublished(Boolean(campaign.invitationPostId))
  }, [campaign.invitationPostId])

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
