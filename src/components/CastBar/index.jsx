import { memo } from 'react'
import './index.css'

function CastBar({ castBar }) {
  return (
    <div className='CastBar'>
      <div className='CastBar__columns'>
        <div
          className='CastBar__icon'
          style={{
            backgroundImage: `url('/tbc-resto-druid-rotation-game/icons/${castBar.spellId}.jpg')`,
          }}
        ></div>
        <div
          key={castBar.startedAt}
          className='CastBar__bar'
          style={{ animationDuration: `${castBar.duration}ms` }}
        ></div>
      </div>
    </div>
  )
}

export default memo(CastBar)
