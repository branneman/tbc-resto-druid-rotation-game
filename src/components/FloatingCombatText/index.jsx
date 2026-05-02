import { useState, useEffect, useRef } from 'react'
import './index.css'

const ALLOW_LIST = ['HOT_TICK', 'HEAL', 'BLOOM']
const FADE_DELAY_MS = 600
const BURST_WINDOW_MS = 100

export default function FloatingCombatText({ castHistory, targetId }) {
  const [amount, setAmount] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef(null)
  const burstStartRef = useRef(0)
  const prevLengthRef = useRef(castHistory.length)

  useEffect(() => {
    const prevLen = prevLengthRef.current
    prevLengthRef.current = castHistory.length

    const newHeals = castHistory
      .slice(prevLen)
      .filter((e) => ALLOW_LIST.includes(e.type) && e.targetId === targetId)

    if (newHeals.length === 0) return

    const maxHeal = Math.max(...newHeals.map((e) => e.amount))
    const now = Date.now()
    const inBurst = now - burstStartRef.current < BURST_WINDOW_MS

    if (inBurst) {
      setAmount((prev) => Math.max(prev, maxHeal))
    } else {
      burstStartRef.current = now
      setAmount(maxHeal)
    }

    setFading(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setFading(true), FADE_DELAY_MS)
  }, [castHistory.length, targetId])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (amount === 0) return null

  return (
    <div className='FloatingCombatText'>
      <span
        className={`FloatingCombatText__item${fading ? ' FloatingCombatText__item--fading' : ''}`}
        onAnimationEnd={() => {
          setAmount(0)
          setFading(false)
        }}
      >
        +{amount}
      </span>
    </div>
  )
}
