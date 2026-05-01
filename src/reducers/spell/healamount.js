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
// Also applies to the direct heal (Bloom) of Lifebloom and the direct portion of Regrowth.
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
  const HOT_COEFFICIENT = (12 / 15) * EMPOWERED_REJUVENATION

  const baseHoT = 1060
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(
    ((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE * IMPROVED_REJUVENATION,
  )
}

export function getRegrowthDirectHeal(spirit, healingpower) {
  const [, DIRECT_SHARE] = _getRegrowthCoeffients()
  const DIRECT_COEFFICIENT = DIRECT_SHARE * EMPOWERED_REJUVENATION

  const baseDirect = 1323.5 // mid-point of 1253 – 1394
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraDirect = effectiveHealingPower * DIRECT_COEFFICIENT

  return Math.round((baseDirect + extraDirect) * GIFT_OF_NATURE)
}

export function getRegrowthHealPerTick(spirit, healingpower) {
  const [HOT_SHARE] = _getRegrowthCoeffients()
  const HOT_COEFFICIENT = HOT_SHARE * EMPOWERED_REJUVENATION
  const TICKS = 7

  const baseHoT = 1274
  const effectiveHealingPower = healingpower + spirit * TREE_OF_LIFE
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * GIFT_OF_NATURE)
}

// https://wow.allakhazam.com/wiki/spell_coefficient_(wow)#Hybrid_spells
function _getRegrowthCoeffients() {
  const CASTTIME = 2
  const DURATION = 21

  // Hybrid spell. The total spell coefficient is shared between the direct and
  // over-time portions. The shares sum to 1:
  //   HoT share:    (Duration / 15) / ((Duration / 15) + (Cast Time / 3.5))
  //   Direct share: 1 - HoT share
  // No additional cast-time / duration penalty is applied: those penalties
  // exist for pure direct / pure HoT spells, not for hybrid splits.
  const HOT_COEFFICIENT = DURATION / 15 / (DURATION / 15 + CASTTIME / 3.5)
  const DIRECT_COEFFICIENT = 1 - HOT_COEFFICIENT

  return [HOT_COEFFICIENT, DIRECT_COEFFICIENT]
}
