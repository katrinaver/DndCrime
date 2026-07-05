import { Link } from 'react-router-dom'
import { creationTypeLabels } from './utils'
import type { CharacterListItem } from './types'

interface CharacterListProps {
  characters: CharacterListItem[]
}

const typeStyles = {
  general: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  campaign: 'bg-dnd-gold/15 text-dnd-gold border-dnd-gold/30',
  classic: 'bg-dnd-purple/15 text-dnd-purple-hover border-dnd-purple/30',
}

export function CharacterList({ characters }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 text-center">
        <p className="text-dnd-muted">Пока нет персонажей. Создайте первого!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {characters.map((character) => (
        <Link
          key={character.id}
          to={`/characters/${character.id}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-dnd-border bg-dnd-card p-4 transition hover:border-dnd-purple/50 hover:bg-dnd-dark/30"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{character.name}</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${typeStyles[character.creationType]}`}
              >
                {creationTypeLabels[character.creationType]}
              </span>
            </div>
            <p className="mt-1 text-sm text-dnd-muted">
              {character.species} · {character.className} {character.level} ур.
              {character.campaignName && ` · ${character.campaignName}`}
            </p>
          </div>
          <span className="shrink-0 text-xs text-dnd-muted">{character.updatedAt}</span>
        </Link>
      ))}
    </div>
  )
}
