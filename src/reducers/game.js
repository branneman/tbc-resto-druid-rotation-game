import { SPELL_DATA } from './spelldata.js'

export const INITIAL_STATE = {
  gameTime: 0, // raw rAF timestamp; updated every TICK
  castBar: null, // { spellId, startedAt, duration } | null
  gcdEndsAt: 0, // absolute rAF timestamp when GCD expires
  activeEffects: [], // [{ id, spellId, appliedAt, duration, tickInterval, ticksFired, stacks }]
  mana: 7000,
  maxMana: 7000,
  nsActive: false, // Nature's Swiftness buff is up; next spell is instant
  nsCooldownEndsAt: 0,
  castHistory: [], // append-only event log; every game event is pushed here
  nextEffectId: 1, // auto-increment for stable effect identity
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'PLAYER_CAST':
      return handlePlayerCast(state, action)
    case 'TICK':
      return handleTick(state, action)
    default:
      return state
  }
}

// Reducer action: PLAYER_CAST
//
// Fired from UI button clicks. Validates the cast and either:
//   - Applies the effect immediately (instant spells)
//   - Sets the cast bar (cast-time spells)
function handlePlayerCast(state, { spellId, timestamp }) {
  const spell = SPELL_DATA[spellId]
  if (!spell) return state

  // --- Validation (return unchanged state = swallow the input) ---

  // GCD blocks all spells except NS (off-GCD)
  if (spell.gcd > 0 && timestamp < state.gcdEndsAt) return state

  // Can't begin a new cast while one is already channeling
  if (state.castBar !== null) return state

  if (state.mana < spell.manaCost) return state

  if (spellId === 'natures_swiftness' && timestamp < state.nsCooldownEndsAt)
    return state

  // Swiftmend requires an active Rejuv or Regrowth to consume
  if (spellId === 'swiftmend') {
    const hasConsumable = state.activeEffects.some(
      (e) => e.spellId === 'rejuvenation' || e.spellId === 'regrowth',
    )
    if (!hasConsumable) return state
  }

  // --- Resolve effective cast time ---
  // NS makes the next spell instant (all spells here are Nature spells).
  // NS itself does not consume NS.
  const effectiveCastTime =
    state.nsActive && spellId !== 'natures_swiftness' && spell.castTime > 0
      ? 0
      : spell.castTime

  // NS is consumed by the next spell cast (any spell that isn't NS itself)
  const consumeNs = state.nsActive && spellId !== 'natures_swiftness'

  // --- Build the shared next-state fragment ---
  const castEntry = {
    timestamp,
    type: 'CAST_START',
    spellId,
    instant: effectiveCastTime === 0,
  }

  const baseState = {
    ...state,
    mana: state.mana - spell.manaCost,
    // NS: activating it sets the flag; casting anything else clears it
    nsActive:
      spellId === 'natures_swiftness'
        ? true
        : consumeNs
          ? false
          : state.nsActive,
    nsCooldownEndsAt:
      spellId === 'natures_swiftness'
        ? timestamp + spell.cooldown
        : state.nsCooldownEndsAt,
    // GCD: only triggered by spells that have one
    gcdEndsAt: spell.gcd > 0 ? timestamp + spell.gcd : state.gcdEndsAt,
    castHistory: [...state.castHistory, castEntry],
  }

  // --- Instant cast: apply effect right now ---
  if (effectiveCastTime === 0) {
    return applySpellEffect(baseState, spellId, timestamp)
  }

  // --- Cast-time spell: open the cast bar ---
  return {
    ...baseState,
    castBar: { spellId, startedAt: timestamp, duration: effectiveCastTime },
  }
}

// Reducer action: TICK
//
// Runs every animation frame. Responsibilities:
//   1. Advance gameTime
//   2. Fire pending HoT ticks and remove expired effects
//   3. Detect cast bar completion and apply the finished cast's effect
function handleTick(state, { timestamp }) {
  let newEffects = []
  let newHistory = []
  let nextEffectId = state.nextEffectId
  let newCastBar = state.castBar

  // --- Process active HoTs ---
  //
  // Core pattern: we never schedule future events.
  // We store when an effect started and derive what *should have happened*
  // by comparing elapsed time to the tick interval on every frame.
  for (const effect of state.activeEffects) {
    const spell = SPELL_DATA[effect.spellId]
    const elapsed = timestamp - effect.appliedAt
    const expectedTicks = Math.floor(elapsed / effect.tickInterval)
    const newTickCount = expectedTicks - effect.ticksFired
    const isExpired = elapsed >= effect.duration

    // Fire any ticks that are due (can be >1 if tab was hidden, etc.)
    if (newTickCount > 0) {
      const healPerTick = spell.healPerTick * (effect.stacks ?? 1)
      for (let i = 0; i < newTickCount; i++) {
        newHistory.push({
          timestamp,
          type: 'HOT_TICK',
          spellId: effect.spellId,
          effectId: effect.id,
          amount: healPerTick,
          stacks: effect.stacks ?? 1,
        })
      }
    }

    if (isExpired) {
      // Lifebloom blooms on expiry (not on refresh — refresh is handled in PLAYER_CAST)
      if (effect.spellId === 'lifebloom') {
        const bloomAmount = spell.bloomHeal * (effect.stacks ?? 1)
        newHistory.push({
          timestamp,
          type: 'BLOOM',
          spellId: 'lifebloom',
          effectId: effect.id,
          amount: bloomAmount,
          stacks: effect.stacks ?? 1,
        })
      }
      newHistory.push({
        timestamp,
        type: 'HOT_EXPIRED',
        spellId: effect.spellId,
        effectId: effect.id,
      })
      // Effect is not pushed to newEffects — it's gone
    } else {
      newEffects.push(
        newTickCount > 0 ? { ...effect, ticksFired: expectedTicks } : effect,
      )
    }
  }

  // --- Check cast bar completion ---
  if (state.castBar !== null) {
    const { spellId, startedAt, duration } = state.castBar

    if (timestamp >= startedAt + duration) {
      newCastBar = null
      newHistory.push({ timestamp, type: 'CAST_COMPLETE', spellId })

      const spell = SPELL_DATA[spellId]

      // Direct heal lands on cast completion (e.g. Regrowth initial)
      if (spell.directHeal) {
        newHistory.push({
          timestamp,
          type: 'HEAL',
          spellId,
          amount: spell.directHeal,
        })
      }

      // HoT component begins on cast completion
      if (spell.isHot) {
        // Remove existing instance (refresh scenario)
        newEffects = newEffects.filter((e) => e.spellId !== spellId)
        const newEffectId = nextEffectId++
        newEffects.push({
          id: newEffectId,
          spellId,
          appliedAt: timestamp,
          duration: spell.duration,
          tickInterval: spell.tickInterval,
          ticksFired: 0,
          stacks: 1,
        })
        newHistory.push({
          timestamp,
          type: 'HOT_APPLIED',
          spellId,
          effectId: newEffectId,
        })
      }
    }
  }

  return {
    ...state,
    gameTime: timestamp,
    castBar: newCastBar,
    activeEffects: newEffects,
    nextEffectId,
    castHistory:
      newHistory.length > 0
        ? [...state.castHistory, ...newHistory]
        : state.castHistory,
  }
}

// applySpellEffect
//
// Private helper for instant casts. Applies spell-specific side effects
// to state and returns the new state. Each case is self-contained.
function applySpellEffect(state, spellId, timestamp) {
  const spell = SPELL_DATA[spellId]
  let { activeEffects, nextEffectId, castHistory } = state
  const newHistory = []

  switch (spellId) {
    case 'lifebloom': {
      const existingIdx = activeEffects.findIndex(
        (e) => e.spellId === 'lifebloom',
      )

      if (existingIdx >= 0) {
        // Refresh: reset timer, increment stacks (capped at maxStacks)
        const existing = activeEffects[existingIdx]
        const updated = {
          ...existing,
          appliedAt: timestamp,
          ticksFired: 0,
          stacks: Math.min((existing.stacks ?? 1) + 1, spell.maxStacks),
        }
        activeEffects = [
          ...activeEffects.slice(0, existingIdx),
          updated,
          ...activeEffects.slice(existingIdx + 1),
        ]
        newHistory.push({
          timestamp,
          type: 'HOT_REFRESHED',
          spellId: 'lifebloom',
          effectId: existing.id,
          stacks: updated.stacks,
        })
      } else {
        const newEffectId = nextEffectId++
        activeEffects = [
          ...activeEffects,
          {
            id: newEffectId,
            spellId: 'lifebloom',
            appliedAt: timestamp,
            duration: spell.duration,
            tickInterval: spell.tickInterval,
            ticksFired: 0,
            stacks: 1,
          },
        ]
        newHistory.push({
          timestamp,
          type: 'HOT_APPLIED',
          spellId: 'lifebloom',
          effectId: newEffectId,
          stacks: 1,
        })
      }
      break
    }

    case 'rejuvenation': {
      // Refreshing Rejuv removes the old instance and starts a fresh one
      const existingId = activeEffects.find(
        (e) => e.spellId === 'rejuvenation',
      )?.id
      activeEffects = activeEffects.filter((e) => e.spellId !== 'rejuvenation')
      const newEffectId = nextEffectId++
      activeEffects = [
        ...activeEffects,
        {
          id: newEffectId,
          spellId: 'rejuvenation',
          appliedAt: timestamp,
          duration: spell.duration,
          tickInterval: spell.tickInterval,
          ticksFired: 0,
          stacks: 1,
        },
      ]
      const eventType =
        existingId !== undefined ? 'HOT_REFRESHED' : 'HOT_APPLIED'
      newHistory.push({
        timestamp,
        type: eventType,
        spellId: 'rejuvenation',
        effectId: newEffectId,
      })
      break
    }

    case 'swiftmend': {
      // Consume the most recently applied Rejuv or Regrowth
      const candidates = activeEffects
        .filter((e) => e.spellId === 'rejuvenation' || e.spellId === 'regrowth')
        .sort((a, b) => b.appliedAt - a.appliedAt)
      const consumed = candidates[0]

      if (consumed) {
        const consumedSpell = SPELL_DATA[consumed.spellId]
        const elapsed = timestamp - consumed.appliedAt
        const remainingMs = consumed.duration - elapsed
        const remainingTicks = Math.ceil(remainingMs / consumed.tickInterval)
        const healAmount = remainingTicks * consumedSpell.healPerTick

        activeEffects = activeEffects.filter((e) => e.id !== consumed.id)
        newHistory.push({
          timestamp,
          type: 'HOT_CONSUMED',
          spellId: consumed.spellId,
          effectId: consumed.id,
        })
        newHistory.push({
          timestamp,
          type: 'HEAL',
          spellId: 'swiftmend',
          amount: healAmount,
        })
      }
      break
    }

    case 'natures_swiftness': {
      // State already updated in handlePlayerCast (nsActive: true).
      // Just log the event.
      newHistory.push({
        timestamp,
        type: 'BUFF_APPLIED',
        spellId: 'natures_swiftness',
      })
      break
    }

    default:
      break
  }

  return {
    ...state,
    activeEffects,
    nextEffectId,
    castHistory: [...castHistory, ...newHistory],
  }
}
