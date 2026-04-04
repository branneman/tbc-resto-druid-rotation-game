import FloatingCombatText from '../FloatingCombatText'
import './index.css'

const HOT_SPELL_IDS = ['lifebloom', 'rejuvenation', 'regrowth']

export default function PartyFrames({ state, dispatch }) {
  const { targets, selectedTargetId, activeEffects, castHistory } = state

  return (
    <div className='PartyFrames'>
      {targets.map((target) => (
        <PartyFrame
          key={target.id}
          target={target}
          isSelected={target.id === selectedTargetId}
          effects={activeEffects.filter((e) => e.targetId === target.id)}
          castHistory={castHistory}
          onClick={() =>
            dispatch({ type: 'SELECT_TARGET', targetId: target.id })
          }
        />
      ))}
    </div>
  )
}

function PartyFrame({ target, isSelected, effects, castHistory, onClick }) {
  const healthPct = (target.health / target.maxHealth) * 100

  return (
    <div
      className={`PartyFrame${isSelected ? ' PartyFrame--selected' : ''}`}
      onClick={onClick}
    >
      <FloatingCombatText castHistory={castHistory} targetId={target.id} />
      <div className='PartyFrame__columns'>
        <div
          className='PartyFrame__icon'
          style={{ backgroundImage: `url('/icons/${target.icon}.jpg')` }}
        ></div>
        <div className='PartyFrame__rows'>
          <div className='PartyFrame__name'>{target.name}</div>
          <div className='PartyFrame__healthbar'>
            <div
              className='PartyFrame__healthbar-fill'
              style={{ width: `${healthPct}%` }}
            />
          </div>
          <div className='PartyFrame__hots'>
            {HOT_SPELL_IDS.map((spellId) => {
              const effect = effects.find((e) => e.spellId === spellId)
              return effect ? (
                <div
                  key={spellId}
                  className='PartyFrame__hot'
                  style={{ backgroundImage: `url('/icons/${spellId}.jpg')` }}
                  title={`${spellId}${effect.stacks > 1 ? ` x${effect.stacks}` : ''}`}
                >
                  {effect.stacks > 1 && (
                    <span className='PartyFrame__hot-stacks'>
                      {effect.stacks}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  key={spellId}
                  className='PartyFrame__hot PartyFrame__hot--empty'
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
