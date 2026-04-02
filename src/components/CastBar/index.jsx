import { useState } from 'react'
import Icon from '../Icon'
import { SPELL_DATA } from '../../reducers/spelldata.js'
import './index.css'

export default function CastBar({ state }) {
  // total_component_width (616) - icon_width (56)
  const MAX_CAST_BAR_WIDTH = 560

  const castTime = getSpell(state.castBar.spellId).castTime
  const [secondsLeft, setSecondsLeft] = useState(castTime)
  const _secondsLeft = castTime - (state.gameTime - state.castBar.startedAt)
  if (_secondsLeft !== secondsLeft) setSecondsLeft(_secondsLeft)

  const fillPercentage = (
    (state.gameTime - state.castBar.startedAt) /
    state.castBar.duration
  ).toFixed(2)
  const width = Math.round(MAX_CAST_BAR_WIDTH * fillPercentage)

  if (width <= 0 || width >= MAX_CAST_BAR_WIDTH) {
    return <></>
  }

  return (
    <div className='CastBar'>
      <Icon name={state.castBar.spellId} size='56px' />
      <div className='CastBar__bar' style={{ width: `${width}px` }}></div>
      <div className='CastBar__name'>
        {getSpell(state.castBar.spellId).name}
      </div>
      <div className='CastBar__secondsleft'>
        {(secondsLeft / 1000).toFixed(1)}
      </div>
    </div>
  )
}

function getSpell(spellId) {
  return SPELL_DATA[spellId]
}
