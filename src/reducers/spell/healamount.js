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

// While in this form you increase healing received by 25% of your total Spirit for all party members within 45 yards
const TREE_OF_LIFE = 0.25

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

export function getLifebloomHealPerTick(spirit, healingpower) {
  const TICKS = 7
  const HOT_COEFFICIENT = 0.5203 * EMPOWERED_REJUVENATION

  const baseHoT = 273
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE)
}

export function getLifebloomBloomHeal(spirit, healingpower) {
  const BLOOM_COEFFICIENT = 0.3431 * EMPOWERED_REJUVENATION

  const baseBloom = 600
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraBloom = effectiveHealingPower * BLOOM_COEFFICIENT

  return Math.round((baseBloom + extraBloom) * GIFT_OF_NATURE)
}

export function getRejuvenationHealPerTick(spirit, healingpower) {
  const TICKS = 4
  const HOT_COEFFICIENT = 12 / 15

  const baseHoT = 1060
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(
    ((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE * IMPROVED_REJUVENATION,
  )
}

export function getRegrowthDirectHeal(spirit, healingpower) {
  const [, DIRECT_COEFFICIENT] = _getRegrowthCoeffients()

  const baseDirect = 1323.5 // mid-point of 1253 – 1394
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraDirect = effectiveHealingPower * DIRECT_COEFFICIENT

  return Math.round((baseDirect + extraDirect) * GIFT_OF_NATURE)
}

// Removed *GIFT_OF_NATURE because that matches ingame numbers
export function getRegrowthHealPerTick(spirit, healingpower) {
  const [HOT_COEFFICIENT] = _getRegrowthCoeffients()
  const TICKS = 7

  const baseHoT = 1274
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round((baseHoT + extraHoT) / TICKS)
}

// https://wow.allakhazam.com/wiki/spell_coefficient_(wow)#Hybrid_spells
function _getRegrowthCoeffients() {
  const CASTTIME = 2
  const DURATION = 21

  // Hybrid spell, calculate both direct and over-time portion:
  //   Over-Time portion: ([Duration] / 15) / (([Duration] / 15) + ([Cast Time] / 3.5)) = [Over-Time portion]
  //   Direct portion: 1 - [Over-Time portion] = [Direct portion]
  const UNBOUNDED_HOT_COEFFICIENT =
    DURATION / 15 / (DURATION / 15 + CASTTIME / 3.5)
  const UNBOUNDED_DIRECT_COEFFICIENT = 1 - UNBOUNDED_HOT_COEFFICIENT

  // The duration and cast time limitations are then applied:
  //   Over-Time portion: ([Duration] / 15) * [Over-Time portion] = [Over-Time coefficient]
  //   Direct portion: ([Cast Time / 3.5) * [Direct portion] = [Direct coefficient]
  const HOT_COEFFICIENT = (DURATION / 15) * UNBOUNDED_HOT_COEFFICIENT
  const DIRECT_COEFFICIENT = (CASTTIME / 3.5) * UNBOUNDED_DIRECT_COEFFICIENT

  return [HOT_COEFFICIENT, DIRECT_COEFFICIENT]
}
