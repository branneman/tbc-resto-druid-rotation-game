import { useState } from 'react'
import { SPELL_DATA } from '../../reducers/spell/data.js'
import './index.css'

export default function CastBar({ state }) {
  const BAR_WIDTH_MAX_PERCENTAGE = 90 // %

  const castTime = getSpell(state.castBar.spellId).castTime
  const [secondsLeft, setSecondsLeft] = useState(castTime)
  const _secondsLeft = castTime - (state.gameTime - state.castBar.startedAt)
  if (_secondsLeft !== secondsLeft) setSecondsLeft(_secondsLeft)

  const fillPercentage = (
    (state.gameTime - state.castBar.startedAt) /
    state.castBar.duration
  ).toFixed(2)
  const width = Math.round(BAR_WIDTH_MAX_PERCENTAGE * fillPercentage)

  if (width <= 0 || width >= BAR_WIDTH_MAX_PERCENTAGE) {
    return <></>
  }

  // const spellName = getSpell(state.castBar.spellId).name
  // const secondsLeftStr = (secondsLeft / 1000).toFixed(1)

  return (
    <>
      <div className='CastBar'>
        <div className='CastBar__columns'>
          <div
            className='CastBar__icon'
            style={{
              backgroundImage: `url('/tbc-resto-druid-rotation-game/icons/${state.castBar.spellId}.jpg')`,
            }}
          ></div>
          <div className='CastBar__bar' style={{ width: `${width}%` }}></div>
          {/* <div className='CastBar__name'>{spellName}</div>
          <div className='CastBar__secondsleft'>{secondsLeftStr}</div> */}
        </div>
      </div>
    </>
  )
}

function getSpell(spellId) {
  return SPELL_DATA[spellId]
}
