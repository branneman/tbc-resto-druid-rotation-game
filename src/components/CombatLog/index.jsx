import { memo, useState, useRef, useEffect, useCallback } from 'react'
import { SPELL_NAMES } from '../../reducers/spell/data.js'
import './index.css'

function CombatLog({ castHistory, targets }) {
  const [activeTab, setActiveTab] = useState('log')
  const [copied, setCopied] = useState(false)

  const filteredCastHistory = castHistory
    .map((cast) => ({
      ...cast,
      stringify: stringifyCast(cast, targets),
    }))
    .filter((cast) => Boolean(cast.stringify))

  const [trackedLength, setTrackedLength] = useState(castHistory.length)
  if (trackedLength !== castHistory.length) {
    setTrackedLength(castHistory.length)
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
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [trackedLength, autoScroll, activeTab])

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const handleCopy = useCallback(() => {
    const text =
      activeTab === 'log'
        ? filteredCastHistory.map((c) => c.stringify).join('\n')
        : castHistory
            .map((c) =>
              JSON.stringify({ ...c, timestamp: Math.round(c.timestamp) }),
            )
            .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [activeTab, filteredCastHistory, castHistory])

  return (
    <div className='CombatLog'>
      <div className='CombatLog__tabs'>
        <button
          className={`CombatLog__tab ${activeTab === 'log' ? 'CombatLog__tab--active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          Log
        </button>
        <button
          className={`CombatLog__tab ${activeTab === 'jsonl' ? 'CombatLog__tab--active' : ''}`}
          onClick={() => setActiveTab('jsonl')}
        >
          JSONL
        </button>
        <button
          className={`CombatLog__copyBtn ${copied ? 'CombatLog__copyBtn--copied' : ''}`}
          onClick={handleCopy}
          title='Copy contents'
        >
          {copied ? '✓' : <CopyIcon />}
        </button>
      </div>
      <div
        className='CombatLog__scroll'
        ref={scrollRef}
        onScroll={checkAtBottom}
      >
        {activeTab === 'log' ? (
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
        ) : (
          <pre className='CombatLog__jsonl'>
            {castHistory
              .map((c) =>
                JSON.stringify({ ...c, timestamp: Math.round(c.timestamp) }),
              )
              .join('\n')}
          </pre>
        )}
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

function CopyIcon() {
  return (
    <svg
      width='1em'
      height='1em'
      viewBox='0 0 16 16'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z' />
      <path d='M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1H9v1H2V6h1V5H2z' />
    </svg>
  )
}

export default memo(CombatLog)

function stringifyCast(cast, targets) {
  const targetName =
    targets?.find((t) => t.id === cast.targetId)?.name ?? cast.targetId

  switch (cast.type) {
    case 'HOT_TICK':
    case 'HEAL':
      return `Your ${SPELL_NAMES[cast.spellId]} heals ${targetName} for ${cast.amount}.`
    case 'BLOOM':
      return `${targetName}'s Lifebloom blooms for ${cast.amount}.`
    default:
      return false
  }
}
