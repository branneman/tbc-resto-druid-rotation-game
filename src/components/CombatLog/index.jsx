import { useState, useRef, useEffect } from 'react'
import { SPELL_DATA } from '../../reducers/spelldata.js'
import './index.css'

export default function CombatLog({ castHistory, targets }) {
  const filteredCastHistory = castHistory
    .map((cast) => ({
      ...cast,
      stringify: stringifyCast(cast, targets),
    }))
    .filter((cast) => Boolean(cast.stringify))

  const [historyLength, setHistoryLength] = useState(filteredCastHistory.length)
  if (historyLength !== filteredCastHistory.length) {
    setHistoryLength(filteredCastHistory.length)
  }

  const scrollRef = useRef()
  useEffect(() => {
    const lastElement = scrollRef.current.querySelector('li:last-child')
    if (lastElement === null) return
    lastElement.scrollIntoView(false)
  }, [historyLength])

  return (
    <div className='CombatLog' ref={scrollRef}>
      <ol className='CombatLog__list'>
        {filteredCastHistory.map((cast) => {
          const key = `${cast.timestamp}-${cast.type}-${cast.spellId}`
          return (
            <li key={key} className='CombatLog__listitem'>
              {cast.stringify}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function stringifyCast(cast, targets) {
  const targetName =
    targets?.find((t) => t.id === cast.targetId)?.name ?? cast.targetId

  switch (cast.type) {
    case 'HOT_TICK':
    case 'HEAL':
      return `Your ${SPELL_DATA[cast.spellId].name} heals ${targetName} for ${cast.amount}.`
    case 'BLOOM':
      return `${targetName}'s Lifebloom blooms for ${cast.amount}.`
    default:
      return false
  }
}
