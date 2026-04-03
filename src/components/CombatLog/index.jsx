import { useState, useRef, useEffect } from 'react'
import { SPELL_DATA } from '../../reducers/spelldata.js'
import './index.css'

export default function CombatLog({ castHistory }) {
  const filteredCastHistory = castHistory
    .map((cast) => ({
      ...cast,
      stringify: stringifyCast(cast),
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

function stringifyCast(cast) {
  switch (cast.type) {
    case 'HOT_TICK':
    case 'HEAL':
    case 'BLOOM':
      return `Your ${spellId2spellName(cast)} heals for ${cast.amount}`
    default:
      return false
  }
}

function spellId2spellName({ spellId }) {
  return SPELL_DATA[spellId].name
}
