import { useKeySequenceDetector } from '../../hooks/dom.js'
import './index.css'

export default function ActionBar({ state, dispatch }) {
  const gcdEnabled = state.gameTime >= state.gcdEndsAt
  const props = {
    dispatch,
    gcdEnabled,
    gcdEndsAt: state.gcdEndsAt,
    gameTime: state.gameTime,
  }

  return (
    <div className='ActionBar'>
      <ActionBarButton {...props} shortcut='1' spellId='lifebloom' name='Lifebloom' />
      <ActionBarButton {...props} shortcut='2' spellId='rejuvenation' name='Rejuvenation' />
      <ActionBarButton {...props} shortcut='3' spellId='regrowth' name='Regrowth' />
      <ActionBarButton
        {...props}
        shortcut='4'
        spellId='swiftmend'
        name='Swiftmend'
        cooldownEndsAt={state.swiftmendCooldownEndsAt}
        cooldownDuration={15000}
      />
      <ActionBarButton
        {...props}
        shortcut='5'
        spellId='natures_swiftness'
        name={"Nature's Swiftness"}
        cooldownEndsAt={state.nsCooldownEndsAt}
        cooldownDuration={180000}
      />
    </div>
  )
}

function ActionBarButton({
  spellId,
  name,
  shortcut,
  dispatch,
  gcdEnabled,
  gcdEndsAt,
  gameTime,
  cooldownEndsAt,
  cooldownDuration,
}) {
  const isOnCooldown = cooldownEndsAt != null && gameTime < cooldownEndsAt
  const enabled = gcdEnabled && !isOnCooldown

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
        backgroundImage: `url('/tbc-resto-druid-rotation-game/icons/${spellId}.jpg')`,
      }}
    >
      {isOnCooldown ? (
        <div
          key={cooldownEndsAt}
          className='CooldownOverlay'
          style={{ animationDuration: `${cooldownDuration}ms` }}
        />
      ) : (
        !gcdEnabled && <div key={gcdEndsAt} className='GCDOverlay' />
      )}
      <span className='ActionBarButton__shortcut'>{shortcut}</span>
      <span className='ActionBarButton__name'>{name}</span>
    </div>
  )
}
