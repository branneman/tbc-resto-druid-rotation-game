import './index.css'

export default function ControlPanel({
  infiniteMana,
  spirit,
  healingpower,
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
    </div>
  )
}
