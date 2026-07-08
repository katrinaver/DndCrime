import { isProbablyImageUrl } from '../../lib/media'
import { getProfileInitials } from '../profile/utils'
import type { Campaign } from './types'

interface CampaignMasterCardProps {
  campaign: Campaign
}

export function CampaignMasterCard({ campaign }: CampaignMasterCardProps) {
  const profile = campaign.masterProfile
  const name = profile?.name || campaign.master
  const initials = getProfileInitials(name)
  const avatarIsImage = isProbablyImageUrl(profile?.avatarUrl)

  return (
    <article className="rounded-xl border border-dnd-gold/30 bg-dnd-gold/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-dnd-gold">Мастер кампании</p>

      <div className="mt-4 flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dnd-gold/40 bg-dnd-card text-base font-bold text-dnd-gold">
          {avatarIsImage ? (
            <img src={profile?.avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : profile?.avatarUrl ? (
            <span className="px-1 text-center text-[9px] font-normal leading-tight text-dnd-muted">
              {profile.avatarUrl}
            </span>
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold text-white">{name}</h4>
          {profile?.description ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-300">{profile.description}</p>
          ) : (
            <p className="mt-2 text-sm text-dnd-muted">Мастер пока не добавил описание профиля.</p>
          )}
        </div>
      </div>
    </article>
  )
}
