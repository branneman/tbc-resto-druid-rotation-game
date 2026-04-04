import './index.css'

export default function ControlPanel({ infiniteMana, dispatch }) {
  return (
    <div className='ControlPanel'>
      <label>
        <input
          type='checkbox'
          checked={infiniteMana}
          onChange={() => dispatch({ type: 'TOGGLE_INFINITE_MANA' })}
        />
        <div className='ControlPanel__labeltext'>Infinite mana</div>
      </label>
    </div>
  )
}
