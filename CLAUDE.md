# TBC Resto Druid Rotation Game

A browser-based rotation trainer for TBC Resto Druid healing. The player practices spell sequencing against a real-time game loop. The goal is a fairly realistic simulator, minus haste. The UI design mimics the WoW TBC ingame interface, the actionbar, castbar and combatlog look the same.

## Stack

- React 19 + Vite, plain JS (no TypeScript)
- No test suite

## Architecture

The game is a pure Redux-style reducer driven by `requestAnimationFrame`:

- `src/reducers/game.js` — all game logic; two actions: `PLAYER_CAST` and `TICK`
- `src/reducers/spell/data.js` — static spell definitions
- `src/App.jsx` — wires up `useReducer` + `useAnimationFrame`, passes state down as props
- Components receive `state` + `dispatch` as props; no context, no global store

## Game state shape

```js
{
  gameTime,                  // raw rAF timestamp; updated every TICK
  castBar,                   // { spellId, startedAt, duration, targetId } | null
  gcdEndsAt,
  queuedSpell,               // { spellId, targetId } | null — queued in the last 400ms before GCD/cast ends
  activeEffects,             // [{ id, spellId, targetId, appliedAt, duration, tickInterval, ticksFired, stacks }]
  mana, maxMana, infiniteMana,
  nsActive,                  // Nature's Swiftness buff is up; next spell is instant
  nsCooldownEndsAt,
  swiftmendCooldownEndsAt,
  sessionStartAt,            // rAF timestamp of first TICK; used for early-session HPS clamping
  castHistory,               // append-only event log; every game event is pushed here
  nextEffectId,              // auto-increment for stable effect identity
  targets,                   // [{ id, name, role, icon, health, maxHealth }]
  selectedTargetId,
}
```

## Key mechanics

- **GCD**: 1500ms, triggered by most spells; NS is off-GCD
- **HoT ticks**: derived each frame from `(timestamp - appliedAt) / tickInterval`, not scheduled
- **Lifebloom**: stacks up to 3; blooms on expiry (not on refresh)
- **Swiftmend**: consumes most-recently-applied Rejuv or Regrowth, heals for remaining ticks × healPerTick
- **Nature's Swiftness**: makes next Nature spell instant; 3-min cooldown

## castHistory event types

`CAST_START`, `CAST_COMPLETE`, `HOT_APPLIED`, `HOT_REFRESHED`, `HOT_TICK`, `HOT_EXPIRED`, `HOT_CONSUMED`, `BLOOM`, `HEAL`, `BUFF_APPLIED`

## Layout & CSS

The root `.layout` div uses `aspect-ratio: 16/9; width: 100%; position: relative`. All children are positioned with `position: absolute` and percentage-based `top/left/width/height`. Always `Math.round()` float values before using them in CSS inline styles.

## Components

- `ActionBar` — spell buttons; greys out on GCD, missing mana, or active cooldown
- `CastBar` — animated progress bar for cast-time spells
- `CombatLog` — scrolling event log driven by `castHistory`
- `PartyFrames` — renders one `PartyFrame` per target; shows health bar and active HoTs; dispatches `SELECT_TARGET`
- `FloatingCombatText` — heal numbers that float up over each party frame
- `LifebloomTracker` — shows countdown timers for all 3-stack Lifeblooms across targets
- `HealingMeter` — total healing done, current HPS (10 s sliding window), bar chart breakdown by spell
- `ControlPanel` — start/pause/reset controls
- `ErrorText` — displays reducer error messages

## Other source files

- `src/reducers/spell/healamount.js` — pure heal-amount calculations (lifebloom tick/bloom, rejuv, regrowth)
- `src/hooks/useAnimationFrame.js` — drives the `TICK` loop
- `src/hooks/dom.js` — `useKeySequenceDetector` and other DOM hooks
