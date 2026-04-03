import { useKeySequenceDetector } from '../../hooks/dom.jsx'
import Icon from '../Icon'
import './index.css'

export default function ActionBar({ state, dispatch }) {
  const enabled = state.gameTime >= state.gcdEndsAt
  const props = { dispatch, enabled }

  return (
    <div className='ActionBar'>
      <ActionBarButton
        {...props}
        num='1'
        spellId='lifebloom'
        name='Lifebloom'
      />
      <ActionBarButton
        {...props}
        num='2'
        spellId='rejuvenation'
        name='Rejuvenation'
      />
      <ActionBarButton {...props} num='3' spellId='regrowth' name='Regrowth' />
      <ActionBarButton
        {...props}
        num='4'
        spellId='swiftmend'
        name='Swiftmend'
      />
      <ActionBarButton
        {...props}
        num='5'
        spellId='natures_swiftness'
        name={"Nature's Swiftness"}
      />
    </div>
  )
}

function ActionBarButton({ spellId, name, num, dispatch, enabled }) {
  const onKeyPress = () =>
    dispatch({
      type: 'PLAYER_CAST',
      spellId,
      timestamp: performance.now(),
    })
  useKeySequenceDetector(num, onKeyPress)

  return (
    <div
      className='ActionBarButton'
      onClick={() => onKeyPress()}
      {...(enabled ? {} : { disabled: 'disabled' })}
      style={{
        backgroundImage: `url('/icons/${spellId}.jpg')`,
      }}
    >
      {enabled ? '' : <div className='GCDOverlay'></div>}
      <span className='ActionBarButton__n'>{num}</span>
      <span className='ActionBarButton__name'>{name}</span>
    </div>
  )
}
