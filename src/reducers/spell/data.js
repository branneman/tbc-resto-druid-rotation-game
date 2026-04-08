import { lifebloom, rejuvenation, regrowth } from './healamount.js'

export const SPELL_DATA = {
  lifebloom: {
    id: 'lifebloom',
    name: 'Lifebloom',
    castTime: 0,
    gcd: 1500,
    manaCost: 220,
    isHot: true,
    duration: 7000,
    tickInterval: 1000,
    maxStacks: 3,
    healPerTick: lifebloom.getLifebloomHealPerTick(), // per stack
    bloomHeal: lifebloom.getLifebloomBloomHeal(), // per stack
  },

  // Rank 13
  rejuvenation: {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    castTime: 0,
    gcd: 1500,
    manaCost: 415,
    isHot: true,
    duration: 12000,
    tickInterval: 3000,
    healPerTick: rejuvenation.getRejuvenationHealPerTick(),
  },

  // Rank 10
  regrowth: {
    id: 'regrowth',
    name: 'Regrowth',
    castTime: 2000,
    gcd: 1500,
    manaCost: 675,
    isHot: true,
    duration: 21000,
    tickInterval: 3000,
    healPerTick: regrowth.getRegrowthHealPerTick(),
    directHeal: regrowth.getRegrowthDirectHeal(),
  },

  swiftmend: {
    id: 'swiftmend',
    name: 'Swiftmend',
    castTime: 0,
    gcd: 1500,
    manaCost: 335,
    // Consumes the shortest-time-left Rejuv or Regrowth.
    // Heals for totalPossibleTicks × healPerTick of the consumed HoT.
    cooldown: 15000, // 15s cooldown
  },

  natures_swiftness: {
    id: 'natures_swiftness',
    name: "Nature's Swiftness",
    castTime: 0,
    gcd: 0, // off-GCD: does not trigger or be blocked by GCD
    manaCost: 0,
    cooldown: 180000, // 3 minutes
  },
}
