import './index.css'

// Inspired by: https://wago.io/ts51s5-eA
export default function LifebloomTracker({ activeEffects, gameTime, targets }) {
  const lifeblooms = activeEffects
    .filter((e) => e.spellId === 'lifebloom' && e.stacks === 3)
    .sort((a, b) => a.appliedAt - b.appliedAt)

  if (lifeblooms.length === 0) return null

  return (
    <div className='LifebloomTracker'>
      {lifeblooms.map((effect) => {
        const remaining = Math.round(
          effect.duration - (gameTime - effect.appliedAt),
        )
        const pct = Math.round((remaining / effect.duration) * 100)
        const secsLeft = Math.ceil(remaining / 1000)

        const target = targets.find((t) => t.id === effect.targetId)
        const targetName = target ? target.name : effect.targetId

        return (
          <div key={effect.id} className='LifebloomTracker__bar'>
            <div
              className='LifebloomTracker__fill'
              style={{ width: `${pct}%` }}
            />
            <div className='LifebloomTracker__name'>{targetName}</div>
            <div className='LifebloomTracker__time'>{secsLeft}</div>
            <div className='LifebloomTracker__bar--red'></div>
            <div className='LifebloomTracker__bar--orange'></div>
            <div className='LifebloomTracker__bar--yellow'></div>
          </div>
        )
      })}
    </div>
  )
}
