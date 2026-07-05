import type { CharacterSheet } from '../characters/types'
import { getProfileInitials } from '../profile/profileStorage'

interface CampaignPartyMemberCardProps {
  character: CharacterSheet
}

export function CampaignPartyMemberCard({ character }: CampaignPartyMemberCardProps) {
  const achievements = character.antiAchievements ?? []
  const initials = getProfileInitials(character.name)

  return (
    <article className="rounded-xl border border-dnd-border bg-dnd-dark/40 p-4">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dnd-border bg-dnd-card text-sm font-bold text-dnd-gold">
          {character.avatarFileName ? (
            <span className="px-1 text-center text-[9px] font-normal leading-tight text-dnd-muted">
              {character.avatarFileName}
            </span>
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-white">{character.name}</h4>
          <p className="mt-0.5 text-sm text-dnd-muted">
            {character.species} · {character.className} {character.level} ур.
          </p>
          {character.playerName && (
            <p className="mt-1 text-xs text-dnd-muted">Игрок: {character.playerName}</p>
          )}
          {character.alignment && (
            <p className="mt-1 text-xs text-gray-400">{character.alignment}</p>
          )}
          {character.personalityTraits && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-300">{character.personalityTraits}</p>
          )}
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="mt-4 border-t border-dnd-border/60 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-dnd-muted">
            Антидостижения
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {achievements.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300"
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
