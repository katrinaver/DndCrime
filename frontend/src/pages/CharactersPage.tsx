import { useState } from 'react'
import { CharacterCreateMenu } from '../modules/characters/CharacterCreateMenu'
import { CharacterList } from '../modules/characters/CharacterList'
import { stubCharacterList } from '../modules/characters/characterData'

export function CharactersPage() {
  const [characters] = useState(stubCharacterList)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Мои персонажи</h2>
          <p className="mt-1 text-sm text-dnd-muted">
            {characters.length}{' '}
            {characters.length === 1 ? 'персонаж' : 'персонажей'} в коллекции
          </p>
        </div>
        <CharacterCreateMenu />
      </div>

      <CharacterList characters={characters} />
    </div>
  )
}
