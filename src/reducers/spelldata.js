// Approximate TBC values. Swap in real rank data later.

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
    healPerTick: 273, // per stack, multiplied at tick time
    bloomHeal: 600, // per stack, at expiry
  },
  rejuvenation: {
    id: 'rejuvenation',
    name: 'Rejuvenation',
    castTime: 0,
    gcd: 1500,
    manaCost: 415,
    isHot: true,
    duration: 12000,
    tickInterval: 3000,
    healPerTick: 888,
  },
  regrowth: {
    id: 'regrowth',
    name: 'Regrowth',
    castTime: 2000,
    gcd: 1500,
    manaCost: 675,
    isHot: true,
    duration: 21000,
    tickInterval: 3000,
    healPerTick: 350,
    directHeal: 1200, // applied on cast completion
  },
  swiftmend: {
    id: 'swiftmend',
    name: 'Swiftmend',
    castTime: 0,
    gcd: 1500,
    manaCost: 335,
    // Consumes most recent Rejuv or Regrowth.
    // Heals for remaining ticks × healPerTick of the consumed HoT.
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
