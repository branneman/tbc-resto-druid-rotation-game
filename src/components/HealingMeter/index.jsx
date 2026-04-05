import HealingMeterChart from './HealingMeterChart'
import { formatHealing } from './util'
import './index.css'

const HEALING_TYPES = new Set(['HOT_TICK', 'HEAL', 'BLOOM'])
const HPS_WINDOW_MS = 10_000

export default function HealingMeter({
  castHistory = [],
  gameTime = 0,
  sessionStartAt = 0,
}) {
  const healingEvents = castHistory.filter((e) => HEALING_TYPES.has(e.type))
  const totalHealing = healingEvents.reduce((sum, e) => sum + e.amount, 0)

  // Sliding window for 'current HPS'
  const windowStart = gameTime - HPS_WINDOW_MS
  const windowHealing = healingEvents
    .filter((e) => e.timestamp >= windowStart)
    .reduce((sum, e) => sum + e.amount, 0)

  // Clamp denominator so early-session HPS isn't diluted by unused window time
  const elapsedMs = sessionStartAt > 0 ? gameTime - sessionStartAt : 0
  const windowDenominatorMs = Math.min(HPS_WINDOW_MS, elapsedMs)
  const hps =
    windowDenominatorMs > 0 ? windowHealing / (windowDenominatorMs / 1000) : 0

  return (
    <div className='HealingMeter'>
      <div className='HealingMeter__row'>
        <span className='HealingMeter__label'>Total healing: </span>
        <span className='HealingMeter__value'>
          {formatHealing(totalHealing)}
        </span>
      </div>
      <div className='HealingMeter__row'>
        <span className='HealingMeter__label'>Current HPS: </span>
        <span className='HealingMeter__value'>{formatHealing(hps)}</span>
      </div>
      <HealingMeterChart
        healingEvents={healingEvents}
        gameTime={gameTime}
        sessionStartAt={sessionStartAt}
      />
    </div>
  )
}
