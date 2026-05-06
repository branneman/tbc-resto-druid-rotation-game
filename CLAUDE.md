# TBC Resto Druid Rotation Game

A browser-based rotation trainer for TBC Resto Druid healing. The player practices spell sequencing against a real-time game loop. The goal is a fairly realistic simulator including haste. The UI design mimics the WoW TBC ingame interface, the actionbar, castbar and combatlog look the same.

## Stack

- React 19 + Vite, plain JS (no TypeScript)
- No test suite

## Architecture

The game is a pure Redux-style reducer driven by `requestAnimationFrame`:

- `src/reducers/game.js` — all game logic; actions: `PLAYER_CAST`, `TICK`, `SELECT_TARGET`, `SET_MOUSEOVER`, `TOGGLE_INFINITE_MANA`, `SET_STAT`
- `src/reducers/spell/data.js` — spell definitions; exports `getSpellData(spirit, healingpower, talentsKey, haste)` (full data with computed heal amounts) and `SPELL_NAMES` (static display names)
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
  spirit, healingpower,      // player stats; affect all heal amount calculations
  intellect, mp5,            // player stats; affect mana regeneration
  talents,                   // 'full_resto' | 'dreamstate'; affects heal amounts and mana regen
  haste,                     // haste rating (e.g. 0 / 118 / 247); scales GCD and Regrowth cast time
  mana, maxMana, infiniteMana,
  fiveSecRuleEndsAt,         // rAF timestamp when the 5-second rule window expires
  lastRegenTickAt,           // rAF timestamp of the last 2-second mana regen tick
  nsActive,                  // Nature's Swiftness buff is up; next spell is instant
  nsCooldownEndsAt,
  swiftmendCooldownEndsAt,
  sessionStartAt,            // rAF timestamp of first TICK; used for early-session HPS clamping
  castHistory,               // append-only event log; every game event is pushed here
  nextEffectId,              // auto-increment for stable effect identity
  targets,                   // [{ id, name, icon, health, maxHealth, isPlayer?, resource, currentResource?, maxResource? }]
  selectedTargetId,
  mouseoverTargetId,         // set by SET_MOUSEOVER; spells target this over selectedTargetId when non-null
}
```

## Key mechanics

- **GCD**: 1500ms base, hasted via `1 + haste / 15.77`, floored at 1000ms; triggered by most spells; NS is off-GCD. Regrowth cast time is also hasted by the same formula.
- **HoT ticks**: derived each frame from `(timestamp - appliedAt) / tickInterval`, not scheduled
- **Lifebloom**: stacks up to 3; blooms on expiry (not on refresh)
- **Swiftmend**: consumes the Rejuv or Regrowth with the shortest time remaining on the target, heals for totalTicks × healPerTick
- **Nature's Swiftness**: makes next Nature spell instant; 3-min cooldown
- **Mouseover healing**: spells resolve their target as `mouseoverTargetId ?? selectedTargetId`; `SET_MOUSEOVER` is dispatched on `onMouseEnter`/`onMouseLeave` of party frames
- **Mana regeneration**: discrete 2-second tick matching WoW behaviour. Spirit-based regen formula: `0.009327 × sqrt(intellect) × spirit` per second; suppressed to `intensity%` during the 5-second rule (5SR) window. 5SR starts when mana is spent (cast completion for cast-time spells, immediately for instants; NS costs 0 and does not trigger 5SR). MP5 ticks every 2s regardless of 5SR. Talent presets in `manaregen.js`: full_resto has 30% Intensity; dreamstate has 30% Intensity + 4% of intellect as additional MP5.

## castHistory event types

`CAST_START`, `CAST_COMPLETE`, `HOT_APPLIED`, `HOT_REFRESHED`, `HOT_TICK`, `HOT_EXPIRED`, `HOT_CONSUMED`, `BLOOM`, `HEAL`, `BUFF_APPLIED`

## Layout & CSS

The root `.layout` div uses `aspect-ratio: 16/9; width: 100%; position: relative`. All children are positioned with `position: absolute` and percentage-based `top/left/width/height`. Always `Math.round()` float values before using them in CSS inline styles.

## Components

- `ActionBar` — spell buttons; greys out on GCD, missing mana, or active cooldown
- `CastBar` — animated progress bar for cast-time spells
- `CombatLog` — scrolling event log driven by `castHistory`
- `PartyFrames` — renders one `PartyFrame` per target; shows health bar, resource bar (mana/rage/energy, color-coded), and active HoTs; dispatches `SELECT_TARGET` and `SET_MOUSEOVER`
- `FloatingCombatText` — heal numbers that float up over each party frame
- `LifebloomTracker` — shows countdown timers for all 3-stack Lifeblooms across targets
- `HealingMeter` — total healing done, current HPS (10 s sliding window), bar chart breakdown by spell
- `ControlPanel` — infinite mana toggle, talent spec selector, haste rating selector (0 / 118 / 247), spirit/healing power/intellect/MP5 inputs; dispatches `SET_STAT` and `TOGGLE_INFINITE_MANA`
- `ErrorText` — displays reducer error messages
- `Explainer` — full-screen overlay shown on every page load; tabbed layout with a rotation overview tab and a 5GCD Cycle tab documenting haste breakpoints; dismissed via Start button or Escape key

## Other source files

- `src/reducers/spell/healamount.js` — pure heal-amount calculations (lifebloom tick/bloom, rejuv, regrowth); exports `TALENT_PRESETS` used by `data.js`
- `src/reducers/spell/manaregen.js` — pure mana regen calculation; exports `getManaRegenPerMs(spirit, intellect, mp5, talents, inFiveSR)`
- `src/hooks/useAnimationFrame.js` — drives the `TICK` loop
- `src/hooks/dom.js` — `useKeySequenceDetector` and other DOM hooks
