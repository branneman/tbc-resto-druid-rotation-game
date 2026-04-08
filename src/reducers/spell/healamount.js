export const lifebloom = {
  getLifebloomHealPerTick,
  getLifebloomBloomHeal,
}
export const rejuvenation = {
  getRejuvenationHealPerTick,
}
export const regrowth = {
  getRegrowthDirectHeal,
  getRegrowthHealPerTick,
}

const HEALING_POWER = 1832
const SPIRIT = 388

// Tree of Life adds to effective healing power
const TREE_OF_LIFE_HEALING_POWER = SPIRIT * 0.25
const EFFECTIVE_HEALING_POWER = HEALING_POWER + TREE_OF_LIFE_HEALING_POWER

// Improved Rejuvenation only touches Rejuvenation itself.
// Multiplies the total heal.
const IMPROVED_REJUVENATION = 1.15 // 3 × 5%

// Multiplies the total heal.
const GIFT_OF_NATURE = 1.1 // 5 × 2%

// Empowered Rejuvenation multiplies the coefficient.
// It applies to all periodic healing, so it's on every HoT coefficient and the bloom.
// Also applies to the direct heal (Bloom) of Lifebloom.
// Regrowth's direct portion does not get it.
const EMPOWERED_REJUVENATION = 1.2 // 5 × 4%

export function getLifebloomHealPerTick() {
  const TICKS = 7
  const HOT_COEFFICIENT = 0.5203 * EMPOWERED_REJUVENATION

  const baseHoT = 273
  const extraHoT = EFFECTIVE_HEALING_POWER * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE)
}

export function getLifebloomBloomHeal() {
  const BLOOM_COEFFICIENT = 0.3431 * EMPOWERED_REJUVENATION

  const baseBloom = 600
  const extraBloom = EFFECTIVE_HEALING_POWER * BLOOM_COEFFICIENT

  return Math.round((baseBloom + extraBloom) * GIFT_OF_NATURE)
}

export function getRejuvenationHealPerTick() {
  const TICKS = 4
  const HOT_COEFFICIENT = 12 / 15

  const baseHoT = 1060
  const extraHoT = EFFECTIVE_HEALING_POWER * HOT_COEFFICIENT

  return Math.round(
    ((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE * IMPROVED_REJUVENATION,
  )
}

export function getRegrowthDirectHeal() {
  const DURATION = 21
  const DIRECT_COEFFICIENT =
    (DURATION / 15) * (DURATION / 15 / (DURATION / 15 + DURATION / 15))

  const baseDirect = 1323.5 // mid-point of 1253 – 1394
  const extraDirect = EFFECTIVE_HEALING_POWER * DIRECT_COEFFICIENT

  return Math.round((baseDirect + extraDirect) * GIFT_OF_NATURE)
}

export function getRegrowthHealPerTick() {
  const TICKS = 7
  const CASTTIME = 2
  const DURATION = 21
  const HOT_COEFFICIENT =
    (DURATION / 15) * (DURATION / 15 / (DURATION / 15 + CASTTIME / 3.5))

  const baseHoT = 1274
  const extraHoT = EFFECTIVE_HEALING_POWER * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE)
}
