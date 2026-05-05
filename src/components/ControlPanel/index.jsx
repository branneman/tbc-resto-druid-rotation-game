import { memo } from 'react'
import './index.css'

function ControlPanel({
  infiniteMana,
  spirit,
  healingpower,
  intellect,
  mp5,
  talents,
  dispatch,
}) {
  function handleStatChange(stat, value) {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      dispatch({ type: 'SET_STAT', stat, value: parsed })
    }
  }

  function handleStatKeyDown(e) {
    if (e.key === 'Enter') e.target.blur()
  }

  return (
    <div className='ControlPanel'>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Infinite mana</div>
        <div className='ControlPanel__control'>
          <input
            type='checkbox'
            checked={infiniteMana}
            onChange={(e) => {
              dispatch({ type: 'TOGGLE_INFINITE_MANA' })
              e.target.blur()
            }}
          />
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Talents</div>
        <div className='ControlPanel__control'>
          <select
            className='ControlPanel__select'
            value={talents}
            onChange={(e) => {
              dispatch({
                type: 'SET_STAT',
                stat: 'talents',
                value: e.target.value,
              })
              e.target.blur()
            }}
          >
            <option value='full_resto'>Full Resto</option>
            <option value='dreamstate'>Dreamstate</option>
          </select>
          {talents === 'dreamstate' && (
            <a
              className='ControlPanel__talentlink'
              href='https://www.wowhead.com/tbc/talent-calc/druid/5003223122031312203--500533100315'
              target='_blank'
              rel='noreferrer'
            >
              talent calculator
            </a>
          )}
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Intellect</div>
        <div className='ControlPanel__control'>
          <input
            className='ControlPanel__statinput'
            value={intellect}
            onChange={(e) => handleStatChange('intellect', e.target.value)}
            onKeyDown={handleStatKeyDown}
          />
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Spirit</div>
        <div className='ControlPanel__control'>
          <input
            className='ControlPanel__statinput'
            value={spirit}
            onChange={(e) => handleStatChange('spirit', e.target.value)}
            onKeyDown={handleStatKeyDown}
          />
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Healing power</div>
        <div className='ControlPanel__control'>
          <input
            className='ControlPanel__statinput'
            value={healingpower}
            onChange={(e) => handleStatChange('healingpower', e.target.value)}
            onKeyDown={handleStatKeyDown}
          />
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>MP5</div>
        <div className='ControlPanel__control'>
          <input
            className='ControlPanel__statinput'
            value={mp5}
            onChange={(e) => handleStatChange('mp5', e.target.value)}
            onKeyDown={handleStatKeyDown}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(ControlPanel)
