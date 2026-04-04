import { useState } from 'react'
import './index.css'

export default function FloatingCombatText({ castHistory, targetId }) {
  const [dismissed, setDismissed] = useState(() => new Set())

  const ALLOW_LIST = ['HOT_TICK', 'HEAL', 'BLOOM']
  const floaters = castHistory
    .map((entry, id) => ({ ...entry, id, ...slotFromId(id) }))
    .filter(
      (e) =>
        ALLOW_LIST.includes(e.type) &&
        e.targetId === targetId &&
        !dismissed.has(e.id),
    )

  return (
    <div className='FloatingCombatText'>
      {floaters.map((f) => (
        <span
          key={f.id}
          className='FloatingCombatText__item'
          style={{ '--x': `${f.x}px`, '--y': `${f.y}px` }}
          onAnimationEnd={() =>
            setDismissed((prev) => new Set([...prev, f.id]))
          }
        >
          +{f.amount}
        </span>
      ))}
    </div>
  )
}

// Four slots that stagger simultaneous heals into a staircase, matching
// WoW FCT behaviour. Each slot has a different x (horizontal spread) and y
// (starting height above the bottom). Slots cycle by event id so the layout
// is deterministic and stable across re-renders.
const SLOTS = [
  { x: 0, y: 0 },
  { x: 22, y: 20 },
  { x: -18, y: 40 },
  { x: 8, y: 60 },
]
function slotFromId(id) {
  return SLOTS[id % SLOTS.length]
}
