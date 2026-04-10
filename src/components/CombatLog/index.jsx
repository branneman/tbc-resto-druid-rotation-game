import { useState, useRef, useEffect, useCallback } from 'react'
import { SPELL_DATA } from '../../reducers/spell/data.js'
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
  const [autoScroll, setAutoScroll] = useState(true)

  const checkAtBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    setAutoScroll(atBottom)
  }, [])

  useEffect(() => {
    if (!autoScroll) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [historyLength, autoScroll])

  const scrollToBottom = () => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  return (
    <div className='CombatLog'>
      <div
        className='CombatLog__scroll'
        ref={scrollRef}
        onScroll={checkAtBottom}
      >
        <ol className='CombatLog__list'>
          {filteredCastHistory.map((cast) => {
            const key = `${cast.timestamp}-${cast.type}-${cast.spellId}-${cast.targetId}`
            return (
              <li key={key} className='CombatLog__listitem'>
                {cast.stringify}
              </li>
            )
          })}
        </ol>
      </div>
      <button
        className={`CombatLog__scrollBtn ${autoScroll ? 'CombatLog__scrollBtn--active' : ''}`}
        onClick={scrollToBottom}
        title={autoScroll ? 'Auto-scrolling' : 'Click to resume auto-scroll'}
      >
        ▼
      </button>
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
