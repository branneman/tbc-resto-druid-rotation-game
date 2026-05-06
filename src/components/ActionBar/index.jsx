import { useState } from 'react'
import { useKeySequenceDetector } from '../../hooks/dom.js'
import './index.css'

export default function ActionBar({ state, dispatch }) {
  const gcdDuration = Math.max(
    1000,
    Math.round(1500 / (1 + (state.haste || 0) / 15.77)),
  )
  const props = {
    dispatch,
    gcdEndsAt: state.gcdEndsAt,
    gcdDuration,
  }

  return (
    <div className='ActionBar'>
      <ActionBarButton
        {...props}
        shortcut='1'
        whSpellId='33763'
        spellId='lifebloom'
        name='Lifebloom'
      />
      <ActionBarButton
        {...props}
        shortcut='2'
        whSpellId='26982'
        spellId='rejuvenation'
        name='Rejuvenation'
      />
      <ActionBarButton
        {...props}
        shortcut='3'
        whSpellId='26980'
        spellId='regrowth'
        name='Regrowth'
      />
      <ActionBarButton
        {...props}
        shortcut='4'
        whSpellId='17116'
        spellId='natures_swiftness'
        name={"Nature's Swiftness"}
        cooldownEndsAt={state.nsCooldownEndsAt}
        cooldownDuration={180000}
      />
      <ActionBarButton
        {...props}
        shortcut='5'
        whSpellId='18562'
        spellId='swiftmend'
        name='Swiftmend'
        cooldownEndsAt={state.swiftmendCooldownEndsAt}
        cooldownDuration={15000}
        unavailable={state.talents === 'dreamstate'}
      />
    </div>
  )
}

function ActionBarButton({
  spellId,
  whSpellId,
  name,
  shortcut,
  dispatch,
  gcdEndsAt,
  gcdDuration,
  cooldownEndsAt,
  cooldownDuration,
  unavailable,
}) {
  const [showGcd, setShowGcd] = useState(false)
  const [prevGcdEndsAt, setPrevGcdEndsAt] = useState(() => gcdEndsAt)
  if (gcdEndsAt !== prevGcdEndsAt) {
    setPrevGcdEndsAt(gcdEndsAt)
    setShowGcd(true)
  }

  const [showCooldown, setShowCooldown] = useState(false)
  const [prevCooldownEndsAt, setPrevCooldownEndsAt] = useState(
    () => cooldownEndsAt,
  )
  if (cooldownEndsAt !== prevCooldownEndsAt) {
    setPrevCooldownEndsAt(cooldownEndsAt)
    if (cooldownEndsAt != null) setShowCooldown(true)
  }

  const enabled = !unavailable && !showGcd && !showCooldown

  const onKeyPress = () => {
    if (unavailable) return
    dispatch({ type: 'PLAYER_CAST', spellId, timestamp: performance.now() })
  }
  useKeySequenceDetector(shortcut, onKeyPress)

  return (
    <a
      className='ActionBarButton'
      href={`https://www.wowhead.com/tbc/spell=${whSpellId}`}
      data-wowhead={`spell=${whSpellId}`}
      onClick={(e) => {
        // prevent link from activating, <a> is required for WH tooltips
        e.preventDefault()
        onKeyPress()
      }}
      {...(enabled ? {} : { disabled: 'disabled' })}
      style={{
        backgroundImage: `url('/tbc-resto-druid-rotation-game/icons/${spellId}.jpg')`,
        ...(unavailable ? { opacity: 0, pointerEvents: 'none' } : {}),
      }}
    >
      {showCooldown ? (
        <div
          key={cooldownEndsAt}
          className='CooldownOverlay'
          style={{ animationDuration: `${cooldownDuration}ms` }}
          onAnimationEnd={() => setShowCooldown(false)}
        />
      ) : (
        showGcd && (
          <div
            key={gcdEndsAt}
            className='GCDOverlay'
            style={{ animationDuration: `${gcdDuration}ms` }}
            onAnimationEnd={() => setShowGcd(false)}
          />
        )
      )}
      <span className='ActionBarButton__shortcut'>{shortcut}</span>
      <span className='ActionBarButton__name'>{name}</span>
    </a>
  )
}
