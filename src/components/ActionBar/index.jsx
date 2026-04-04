import { useKeySequenceDetector } from '../../hooks/dom.js'
import './index.css'

export default function ActionBar({ state, dispatch }) {
  const enabled = state.gameTime >= state.gcdEndsAt
  const props = { dispatch, enabled, gcdEndsAt: state.gcdEndsAt }

  return (
    <div className='ActionBar'>
      <ActionBarButton
        {...props}
        shortcut='1'
        spellId='lifebloom'
        name='Lifebloom'
      />
      <ActionBarButton
        {...props}
        shortcut='2'
        spellId='rejuvenation'
        name='Rejuvenation'
      />
      <ActionBarButton
        {...props}
        shortcut='3'
        spellId='regrowth'
        name='Regrowth'
      />
      <ActionBarButton
        {...props}
        shortcut='4'
        spellId='swiftmend'
        name='Swiftmend'
      />
      <ActionBarButton
        {...props}
        shortcut='5'
        spellId='natures_swiftness'
        name={"Nature's Swiftness"}
      />
    </div>
  )
}

function ActionBarButton({
  spellId,
  name,
  shortcut,
  dispatch,
  enabled,
  gcdEndsAt,
}) {
  const onKeyPress = () =>
    dispatch({
      type: 'PLAYER_CAST',
      spellId,
      timestamp: performance.now(),
    })
  useKeySequenceDetector(shortcut, onKeyPress)

  return (
    <div
      className='ActionBarButton'
      onClick={() => onKeyPress()}
      {...(enabled ? {} : { disabled: 'disabled' })}
      style={{
        backgroundImage: `url('/icons/${spellId}.jpg')`,
      }}
    >
      {enabled ? '' : <div key={gcdEndsAt} className='GCDOverlay'></div>}
      <span className='ActionBarButton__shortcut'>{shortcut}</span>
      <span className='ActionBarButton__name'>{name}</span>
    </div>
  )
}
