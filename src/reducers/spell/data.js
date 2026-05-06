import {
  lifebloom,
  rejuvenation,
  regrowth,
  TALENT_PRESETS,
} from './healamount.js'

export const SPELL_NAMES = {
  lifebloom: 'Lifebloom',
  rejuvenation: 'Rejuvenation',
  regrowth: 'Regrowth',
  swiftmend: 'Swiftmend',
  natures_swiftness: "Nature's Swiftness",
}

export function getSpellData(
  spirit,
  healingpower,
  talentsKey = 'full_resto',
  haste = 0,
) {
  const talents = TALENT_PRESETS[talentsKey] ?? TALENT_PRESETS.full_resto

  const hasteMultiplier = 1 + haste / 15.77
  const hastedGcd = Math.max(1000, Math.round(1500 / hasteMultiplier))

  return {
    lifebloom: {
      id: 'lifebloom',
      name: SPELL_NAMES.lifebloom,
      castTime: 0,
      gcd: hastedGcd,
      manaCost: 220,
      isHot: true,
      duration: 7000,
      tickInterval: 1000,
      maxStacks: 3,
      healPerTick: lifebloom.getLifebloomHealPerTick(
        spirit,
        healingpower,
        talents,
      ), // per stack
      bloomHeal: lifebloom.getLifebloomBloomHeal(spirit, healingpower, talents), // per stack
    },

    // Rank 13
    rejuvenation: {
      id: 'rejuvenation',
      name: SPELL_NAMES.rejuvenation,
      castTime: 0,
      gcd: hastedGcd,
      manaCost: 415,
      isHot: true,
      duration: 12000,
      tickInterval: 3000,
      healPerTick: rejuvenation.getRejuvenationHealPerTick(
        spirit,
        healingpower,
        talents,
      ),
    },

    // Rank 10
    regrowth: {
      id: 'regrowth',
      name: SPELL_NAMES.regrowth,
      castTime: Math.round(2000 / hasteMultiplier),
      gcd: hastedGcd,
      manaCost: 675,
      isHot: true,
      duration: 21000,
      tickInterval: 3000,
      healPerTick: regrowth.getRegrowthHealPerTick(
        spirit,
        healingpower,
        talents,
      ),
      directHeal: regrowth.getRegrowthDirectHeal(spirit, healingpower, talents),
    },

    swiftmend: {
      id: 'swiftmend',
      name: SPELL_NAMES.swiftmend,
      castTime: 0,
      gcd: hastedGcd,
      manaCost: 335,
      // Consumes the shortest-time-left Rejuv or Regrowth.
      // Heals for totalPossibleTicks × healPerTick of the consumed HoT.
      cooldown: 15000, // 15s cooldown
    },

    natures_swiftness: {
      id: 'natures_swiftness',
      name: SPELL_NAMES.natures_swiftness,
      castTime: 0,
      gcd: 0, // off-GCD: does not trigger or be blocked by GCD
      manaCost: 0,
      cooldown: 180000, // 3 minutes
    },
  }
}
