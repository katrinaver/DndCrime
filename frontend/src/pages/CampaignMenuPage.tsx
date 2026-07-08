import { useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CampaignMasterCard } from '../modules/campaigns/CampaignMasterCard'
import { CampaignPartyMemberCard } from '../modules/campaigns/CampaignPartyMemberCard'
import type { CampaignRoomContext } from '../modules/campaigns/CampaignRoomLayout'
import { useCharacterStore } from '../store/characterStore'

export function CampaignMenuPage() {
  const { campaign, character } = useOutletContext<CampaignRoomContext>()
  const party = useCharacterStore((s) => s.getPartyByCampaignId(campaign.id))
  const fetchParty = useCharacterStore((s) => s.fetchParty)

  const myAchievements = character?.antiAchievements ?? []
  const partyMembers = party.filter((member) => member.id !== character?.id)

  useEffect(() => {
    void fetchParty(campaign.id)
  }, [campaign.id, fetchParty])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CampaignMasterCard campaign={campaign} />

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          О кампании
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-dnd-muted">Сеттинг</dt>
            <dd className="mt-0.5 text-white">{campaign.setting || '—'}</dd>
          </div>
          <div>
            <dt className="text-dnd-muted">Место</dt>
            <dd className="mt-0.5 text-white">{campaign.place || '—'}</dd>
          </div>
          <div>
            <dt className="text-dnd-muted">Последняя сессия</dt>
            <dd className="mt-0.5 text-white">{campaign.lastSession ?? '—'}</dd>
          </div>
          {campaign.sessionDate && (
            <div>
              <dt className="text-dnd-muted">Ближайшая сессия</dt>
              <dd className="mt-0.5 text-white">
                {campaign.sessionDate}
                {campaign.sessionTime && ` · ${campaign.sessionTime}`}
              </dd>
            </div>
          )}
          {campaign.extraParams && (
            <div>
              <dt className="text-dnd-muted">Доп. параметры</dt>
              <dd className="mt-0.5 text-white">{campaign.extraParams}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
          Ваш персонаж
        </h3>
        {character ? (
          <div className="mt-4">
            <p className="text-lg font-semibold text-white">{character.name}</p>
            <p className="mt-1 text-sm text-dnd-muted">
              {character.species} · {character.className} {character.level} ур.
            </p>
            {character.background && (
              <p className="mt-3 text-sm text-gray-300">{character.background}</p>
            )}
            {myAchievements.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-dnd-muted">
                  Антидостижения персонажа
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {myAchievements.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              to={`/characters/${character.id}`}
              className="mt-4 inline-block text-sm text-dnd-gold hover:underline"
            >
              Открыть лист персонажа →
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-dnd-muted">Персонаж ещё не создан</p>
        )}
      </section>

      {partyMembers.length > 0 && (
        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Партия
          </h3>
          <p className="mt-1 text-xs text-dnd-muted">
            Другие персонажи кампании — только краткая информация, лист недоступен
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {partyMembers.map((member) => (
              <CampaignPartyMemberCard key={member.id} character={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
