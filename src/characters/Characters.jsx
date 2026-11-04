// Renderiza todos os personagens ativos (clientes e funcionários).
import React from 'react'
import { useGame } from '../systems/store'
import { getEntity } from '../systems/simulation'
import { CharacterModel } from './CharacterModel'

export function Characters() {
  const entities = useGame((s) => s.entities)
  const quality = useGame((s) => s.settings.quality)
  return <group>
    {entities.map(({ id }) => {
      const e = getEntity(id)
      if (!e) return null
      return <CharacterModel key={id} id={id} appearance={e.appearance} quality={quality} />
    })}
  </group>
}
