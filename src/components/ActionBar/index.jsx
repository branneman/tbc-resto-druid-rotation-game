import { useKeySequenceDetector } from '../../hooks/dom.jsx'
import Icon from '../Icon'
import './index.css'

export default function ActionBar({ state, dispatch }) {
  const enabled = state.gameTime >= state.gcdEndsAt
  const props = { dispatch, enabled }

  return (
    <div className='ActionBar'>
      <ActionBarButton {...props} n='1' spellId='lifebloom' name='Lifebloom' />
      <ActionBarButton
        {...props}
        n='2'
        spellId='rejuvenation'
        name='Rejuvenation'
      />
      <ActionBarButton {...props} n='3' spellId='regrowth' name='Regrowth' />
      <ActionBarButton {...props} n='4' spellId='swiftmend' name='Swiftmend' />
      <ActionBarButton
        {...props}
        n='5'
        spellId='natures_swiftness'
        name={"Nature's Swiftness"}
      />
    </div>
  )
}

function ActionBarButton({ spellId, name, n, dispatch, enabled }) {
  const onKeyPress = () =>
    dispatch({
      type: 'PLAYER_CAST',
      spellId,
      timestamp: performance.now(),
    })
  useKeySequenceDetector(n, onKeyPress)

  return (
    <div
      className='ActionBarButton'
      onClick={() => onKeyPress()}
      {...(enabled ? {} : { disabled: 'disabled' })}
    >
      <Icon name={spellId} size='56px' />
      {enabled ? '' : <GCDOverlay />}
      <span className='ActionBarButton__n'>{n}</span>
      <span className='ActionBarButton__name'>{name}</span>
    </div>
  )
}

function GCDOverlay() {
  return <div className='GCDOverlay'></div>
}
