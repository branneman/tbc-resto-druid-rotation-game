import { getSpellData } from './spell/data.js'
import { getManaRegenPerMs } from './spell/manaregen.js'

const QUEUE_WINDOW = 400 // ms; accept spell inputs this early before cast/GCD ends

export const TARGETS = [
  {
    id: 'player',
    name: 'Dassz',
    icon: 'treeform',
    health: 6000,
    maxHealth: 6000,
    isPlayer: true,
    resource: 'mana',
  },
  {
    id: 'tank',
    name: 'Nezz',
    icon: 'bearform',
    health: 12000,
    maxHealth: 12000,
    resource: 'rage',
    currentResource: 100,
    maxResource: 100,
  },
  {
    id: 'melee',
    name: 'Poisonous',
    icon: 'catform',
    health: 8000,
    maxHealth: 8000,
    resource: 'energy',
    currentResource: 100,
    maxResource: 100,
  },
  {
    id: 'ranged',
    name: 'Peepo',
    icon: 'catform',
    health: 6500,
    maxHealth: 6500,
    resource: 'energy',
    currentResource: 6000,
    maxResource: 6000,
  },
  {
    id: 'peepo',
    name: 'Zeya',
    icon: 'moonkinform',
    health: 8000,
    maxHealth: 8000,
    resource: 'mana',
    currentResource: 100,
    maxResource: 100,
  },
]

// https://www.wowhead.com/tbc/gear-planner/druid/night-elf/A0YQUAMCAC_1AFM0ADFQJTE1H4FgXsiKdQBd3SBd3UBd3QIAdqmDAFVyikyFQFVztagAXd0gXd0GQFVxAF3dIF3dh2B3T3qKAF3dIF3dQF3diEBrE7WGAF3dIF3diQBx_7WkigBzQrWxiwBshLW1jAB6l7W1DQBywA4AeHkPAHphkAB-w7XDEQByWhIAbO4
export const INITIAL_STATE = {
  gameTime: 0, // raw rAF timestamp; updated every TICK
  castBar: null, // { spellId, startedAt, duration, targetId } | null
  gcdEndsAt: 0, // absolute rAF timestamp when GCD expires
  queuedSpell: null, // { spellId, targetId } | null — queued in the last QUEUE_WINDOW ms
  activeEffects: [], // [{ id, spellId, targetId, appliedAt, duration, tickInterval, ticksFired, stacks }]
  spirit: 335,
  healingpower: 1997,
  intellect: 322,
  mp5: 113,
  talents: 'full_resto',
  mana: Infinity,
  maxMana: 7000,
  infiniteMana: true,
  fiveSecRuleEndsAt: 0,
  lastRegenTickAt: 0,
  nsActive: false, // Nature's Swiftness buff is up; next spell is instant
  nsCooldownEndsAt: 0,
  swiftmendCooldownEndsAt: 0,
  sessionStartAt: 0, // rAF timestamp of the first TICK; used for early-session HPS clamping
  castHistory: [], // append-only event log; every game event is pushed here
  nextEffectId: 1, // auto-increment for stable effect identity
  targets: TARGETS,
  selectedTargetId: 'tank',
  mouseoverTargetId: null,
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'PLAYER_CAST':
      return handlePlayerCast(state, action)
    case 'TICK':
      return handleTick(state, action)
    case 'SELECT_TARGET':
      return { ...state, selectedTargetId: action.targetId }
    case 'SET_MOUSEOVER':
      return { ...state, mouseoverTargetId: action.targetId }
    case 'TOGGLE_INFINITE_MANA': {
      const infiniteMana = !state.infiniteMana
      return {
        ...state,
        infiniteMana,
        mana: infiniteMana ? Infinity : state.maxMana,
        // Reset the regen timer so the first tick fires 2 s from now, not
        // from whenever the page loaded (lastRegenTickAt otherwise stays frozen
        // at the first-frame timestamp while infinite mana is active).
        lastRegenTickAt: infiniteMana ? state.lastRegenTickAt : 0,
      }
    }
    case 'SET_STAT':
      return { ...state, [action.stat]: action.value }
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
  const spellData = getSpellData(
    state.spirit,
    state.healingpower,
    state.talents,
  )
  const spell = spellData[spellId]
  if (!spell) return state

  // --- Spell queue window (not applicable to NS, which is off-GCD) ---
  if (spellId !== 'natures_swiftness') {
    const castEndsAt = state.castBar
      ? state.castBar.startedAt + state.castBar.duration
      : 0
    const blockedUntil = Math.max(castEndsAt, state.gcdEndsAt)
    const timeUntilFree = blockedUntil - timestamp

    if (timeUntilFree > 0 && timeUntilFree <= QUEUE_WINDOW) {
      // Last press wins — overwrite any previously queued spell
      return {
        ...state,
        queuedSpell: {
          spellId,
          targetId: state.mouseoverTargetId ?? state.selectedTargetId,
        },
      }
    }
  }

  // --- Validation (return unchanged state = swallow the input) ---

  // GCD blocks all spells except NS (off-GCD)
  if (spell.gcd > 0 && timestamp < state.gcdEndsAt) return state

  // Can't begin a new cast while one is already channeling
  if (state.castBar !== null) return state

  if (state.mana < spell.manaCost) {
    return {
      ...state,
      castHistory: [
        ...state.castHistory,
        { timestamp, type: 'OUT_OF_MANA', spellId },
      ],
    }
  }

  if (spellId === 'natures_swiftness' && timestamp < state.nsCooldownEndsAt)
    return state

  if (spellId === 'swiftmend' && timestamp < state.swiftmendCooldownEndsAt)
    return state

  // Swiftmend requires an active Rejuv or Regrowth on the selected target to consume
  if (spellId === 'swiftmend') {
    const hasConsumable = state.activeEffects.some(
      (e) =>
        (e.spellId === 'rejuvenation' || e.spellId === 'regrowth') &&
        e.targetId === state.selectedTargetId,
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
  const targetId =
    spellId === 'natures_swiftness'
      ? null
      : (state.mouseoverTargetId ?? state.selectedTargetId)

  const castEntry = {
    timestamp,
    type: 'CAST_START',
    spellId,
    targetId,
    instant: effectiveCastTime === 0,
  }

  // In WoW, mana is deducted when a cast *completes*, not when it starts.
  // Cancelling a cast costs nothing. For instant spells start === complete, so
  // we apply mana and 5SR immediately. For cast-time spells both are deferred
  // to handleTick when the cast bar expires.
  const baseState = {
    ...state,
    queuedSpell: null,
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
    swiftmendCooldownEndsAt:
      spellId === 'swiftmend'
        ? timestamp + spell.cooldown
        : state.swiftmendCooldownEndsAt,
    // GCD: only triggered by spells that have one
    gcdEndsAt: spell.gcd > 0 ? timestamp + spell.gcd : state.gcdEndsAt,
    castHistory: [...state.castHistory, castEntry],
  }

  // --- Instant cast: apply effect right now ---
  if (effectiveCastTime === 0) {
    return applySpellEffect(
      {
        ...baseState,
        mana: state.mana - spell.manaCost,
        fiveSecRuleEndsAt:
          spell.manaCost > 0 ? timestamp + 5000 : state.fiveSecRuleEndsAt,
      },
      spellId,
      timestamp,
      targetId,
    )
  }

  // --- Cast-time spell: open the cast bar ---
  // Mana and 5SR are deferred to cast completion in handleTick.
  return {
    ...baseState,
    castBar: {
      spellId,
      startedAt: timestamp,
      duration: effectiveCastTime,
      targetId,
    },
  }
}

// Reducer action: TICK
//
// Runs every animation frame. Responsibilities:
//   1. Advance gameTime
//   2. Fire pending HoT ticks and remove expired effects
//   3. Detect cast bar completion and apply the finished cast's effect
function handleTick(state, { timestamp }) {
  const spellData = getSpellData(
    state.spirit,
    state.healingpower,
    state.talents,
  )
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
    const spell = spellData[effect.spellId]
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
          targetId: effect.targetId,
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
          targetId: effect.targetId,
          effectId: effect.id,
          amount: bloomAmount,
          stacks: effect.stacks ?? 1,
        })
      }
      newHistory.push({
        timestamp,
        type: 'HOT_EXPIRED',
        spellId: effect.spellId,
        targetId: effect.targetId,
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
  let castCompletionManaCost = 0
  let newFiveSecRuleEndsAt = state.fiveSecRuleEndsAt
  if (state.castBar !== null) {
    const { spellId, startedAt, duration, targetId } = state.castBar

    if (timestamp >= startedAt + duration) {
      newCastBar = null
      newHistory.push({ timestamp, type: 'CAST_COMPLETE', spellId, targetId })
      // Mana is deducted and 5SR triggered at cast completion (WoW behaviour).
      const spell = spellData[spellId]
      castCompletionManaCost = spell.manaCost
      if (spell.manaCost > 0) newFiveSecRuleEndsAt = timestamp + 5000

      // Direct heal lands on cast completion (e.g. Regrowth initial)
      if (spell.directHeal) {
        newHistory.push({
          timestamp,
          type: 'HEAL',
          spellId,
          targetId,
          amount: spell.directHeal,
        })
      }

      // HoT component begins on cast completion
      if (spell.isHot) {
        // Remove existing instance on same target (refresh scenario)
        newEffects = newEffects.filter(
          (e) => !(e.spellId === spellId && e.targetId === targetId),
        )
        const newEffectId = nextEffectId++
        newEffects.push({
          id: newEffectId,
          spellId,
          targetId,
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
          targetId,
          effectId: newEffectId,
        })
      }
    }
  }

  // --- Mana regeneration (discrete 2-second tick) ---
  // lastRegenTickAt starts at 0; initialise it to the first frame's timestamp so
  // the first tick fires 2 s into the session rather than immediately.
  // Apply cast completion cost first, then add any regen that fires this frame.
  let newMana = state.mana - castCompletionManaCost
  let newLastRegenTickAt =
    state.lastRegenTickAt === 0 ? timestamp : state.lastRegenTickAt
  if (!state.infiniteMana && timestamp >= newLastRegenTickAt + 2000) {
    const inFiveSR = timestamp < newFiveSecRuleEndsAt
    const regenPerTick =
      getManaRegenPerMs(
        state.spirit,
        state.intellect,
        state.mp5,
        state.talents,
        inFiveSR,
      ) * 2000
    newMana = Math.min(state.maxMana, newMana + regenPerTick)
    newLastRegenTickAt = newLastRegenTickAt + 2000
  }

  let nextState = {
    ...state,
    sessionStartAt:
      state.sessionStartAt === 0 ? timestamp : state.sessionStartAt,
    gameTime: timestamp,
    castBar: newCastBar,
    activeEffects: newEffects,
    nextEffectId,
    mana: newMana,
    fiveSecRuleEndsAt: newFiveSecRuleEndsAt,
    lastRegenTickAt: newLastRegenTickAt,
    castHistory:
      newHistory.length > 0
        ? [...state.castHistory, ...newHistory]
        : state.castHistory,
  }

  // Flush queued spell as soon as cast bar and GCD are both clear
  if (
    nextState.queuedSpell &&
    nextState.castBar === null &&
    timestamp >= nextState.gcdEndsAt
  ) {
    const { spellId, targetId } = nextState.queuedSpell
    nextState = handlePlayerCast(
      { ...nextState, selectedTargetId: targetId, queuedSpell: null },
      { spellId, timestamp },
    )
  }

  return nextState
}

// applySpellEffect
//
// Private helper for instant casts. Applies spell-specific side effects
// to state and returns the new state. Each case is self-contained.
function applySpellEffect(state, spellId, timestamp, targetId) {
  const spellData = getSpellData(
    state.spirit,
    state.healingpower,
    state.talents,
  )
  const spell = spellData[spellId]
  let { activeEffects, nextEffectId, castHistory } = state
  const newHistory = []

  switch (spellId) {
    case 'lifebloom': {
      // Refresh/stack only if there's an existing Lifebloom on the same target
      const existingIdx = activeEffects.findIndex(
        (e) => e.spellId === 'lifebloom' && e.targetId === targetId,
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
          targetId,
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
            targetId,
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
          targetId,
          effectId: newEffectId,
          stacks: 1,
        })
      }
      break
    }

    case 'rejuvenation': {
      // Refreshing Rejuv removes the old instance on the same target and starts a fresh one
      const existingId = activeEffects.find(
        (e) => e.spellId === 'rejuvenation' && e.targetId === targetId,
      )?.id
      activeEffects = activeEffects.filter(
        (e) => !(e.spellId === 'rejuvenation' && e.targetId === targetId),
      )
      const newEffectId = nextEffectId++
      activeEffects = [
        ...activeEffects,
        {
          id: newEffectId,
          spellId: 'rejuvenation',
          targetId,
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
        targetId,
        effectId: newEffectId,
      })
      break
    }

    case 'regrowth': {
      // Direct heal lands instantly
      newHistory.push({
        timestamp,
        type: 'HEAL',
        spellId: 'regrowth',
        targetId,
        amount: spell.directHeal,
      })
      // HoT component: replace any existing Regrowth on the same target
      const existingRegrowthId = activeEffects.find(
        (e) => e.spellId === 'regrowth' && e.targetId === targetId,
      )?.id
      activeEffects = activeEffects.filter(
        (e) => !(e.spellId === 'regrowth' && e.targetId === targetId),
      )
      const newRegrowthId = nextEffectId++
      activeEffects = [
        ...activeEffects,
        {
          id: newRegrowthId,
          spellId: 'regrowth',
          targetId,
          appliedAt: timestamp,
          duration: spell.duration,
          tickInterval: spell.tickInterval,
          ticksFired: 0,
          stacks: 1,
        },
      ]
      newHistory.push({
        timestamp,
        type:
          existingRegrowthId !== undefined ? 'HOT_REFRESHED' : 'HOT_APPLIED',
        spellId: 'regrowth',
        targetId,
        effectId: newRegrowthId,
      })
      break
    }

    case 'swiftmend': {
      // Consume the Rejuv or Regrowth on the selected target that has the shortest time left
      const candidates = activeEffects.filter(
        (e) =>
          (e.spellId === 'rejuvenation' || e.spellId === 'regrowth') &&
          e.targetId === targetId,
      )

      let consumed = undefined
      if (candidates.length > 0) {
        consumed = candidates.reduce((min, cur) => {
          const curRemaining = cur.appliedAt + cur.duration - timestamp
          const minRemaining = min.appliedAt + min.duration - timestamp
          return curRemaining < minRemaining ? cur : min
        }, candidates[0])
      }

      if (consumed) {
        const consumedSpell = spellData[consumed.spellId]
        const totalTicks = consumed.duration / consumed.tickInterval
        const healAmount = totalTicks * consumedSpell.healPerTick

        activeEffects = activeEffects.filter((e) => e.id !== consumed.id)
        newHistory.push({
          timestamp,
          type: 'HOT_CONSUMED',
          spellId: consumed.spellId,
          targetId,
          effectId: consumed.id,
        })
        newHistory.push({
          timestamp,
          type: 'HEAL',
          spellId: 'swiftmend',
          targetId,
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
