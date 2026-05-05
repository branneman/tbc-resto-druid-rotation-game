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

  return (
    <div className='ControlPanel'>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Infinite mana</div>
        <div className='ControlPanel__control'>
          <input
            type='checkbox'
            checked={infiniteMana}
            onChange={() => dispatch({ type: 'TOGGLE_INFINITE_MANA' })}
          />
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Talents</div>
        <div className='ControlPanel__control'>
          <select
            className='ControlPanel__select'
            value={talents}
            onChange={(e) =>
              dispatch({
                type: 'SET_STAT',
                stat: 'talents',
                value: e.target.value,
              })
            }
          >
            <option value='full_resto'>Full Resto</option>
            <option value='dreamstate'>Dreamstate</option>
          </select>
        </div>
      </div>
      <div className='ControlPanel__row'>
        <div className='ControlPanel__label'>Intellect</div>
        <div className='ControlPanel__control'>
          <input
            className='ControlPanel__statinput'
            value={intellect}
            onChange={(e) => handleStatChange('intellect', e.target.value)}
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
          />
        </div>
      </div>
    </div>
  )
}

export default memo(ControlPanel)
