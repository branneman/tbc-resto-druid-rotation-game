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

// Talent multipliers differ between specs.
// treeOfLife: passive aura adds (spirit × treeOfLife) to effective healing power.
//   Full Resto reaches the 41-pt Tree of Life talent; Dreamstate (24/0/37) does not.
// All other healing multipliers are reachable in both specs.
export const TALENT_PRESETS = {
  full_resto: {
    treeOfLife: 0.25, // +25% Spirit to healing power
    improvedRejuvenation: 1.15, // 3 × 5%
    giftOfNature: 1.1, // 5 × 2%
    empoweredRejuvenation: 1.2, // 5 × 4%
  },
  dreamstate: {
    treeOfLife: 0, // no Tree of Life, +0%
    improvedRejuvenation: 1.15,
    giftOfNature: 1.1,
    empoweredRejuvenation: 1.0, // no Empowered Rejuvenation
  },
}

export function getLifebloomHealPerTick(spirit, healingpower, talents) {
  const { treeOfLife, giftOfNature, empoweredRejuvenation } = talents
  const TICKS = 7
  const HOT_COEFFICIENT = 0.5203 * empoweredRejuvenation

  const baseHoT = 273
  const effectiveHealingPower = healingpower + spirit * treeOfLife
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * giftOfNature)
}

export function getLifebloomBloomHeal(spirit, healingpower, talents) {
  const { treeOfLife, giftOfNature } = talents
  // Direct share from the hybrid formula (CT=1.5, D=7), no ER applied.
  // Theoretically should be: 0.3431 * empoweredRejuvenation, but doesn't match ingame numbers
  const BLOOM_COEFFICIENT = 0.4787

  const baseBloom = 600
  const effectiveHealingPower = healingpower + spirit * treeOfLife
  const extraBloom = effectiveHealingPower * BLOOM_COEFFICIENT

  return Math.round((baseBloom + extraBloom) * giftOfNature)
}

export function getRejuvenationHealPerTick(spirit, healingpower, talents) {
  const {
    treeOfLife,
    giftOfNature,
    empoweredRejuvenation,
    improvedRejuvenation,
  } = talents
  const TICKS = 4
  const HOT_COEFFICIENT = (12 / 15) * empoweredRejuvenation

  const baseHoT = 1060
  const effectiveHealingPower = healingpower + spirit * treeOfLife
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(
    ((baseHoT + extraHoT) / TICKS) * giftOfNature * improvedRejuvenation,
  )
}

export function getRegrowthDirectHeal(spirit, healingpower, talents) {
  const { treeOfLife, giftOfNature, empoweredRejuvenation } = talents
  const [, DIRECT_SHARE] = _getRegrowthCoeffients()
  const DIRECT_COEFFICIENT = DIRECT_SHARE * empoweredRejuvenation

  const baseDirect = 1323.5 // mid-point of 1253 – 1394
  const effectiveHealingPower = healingpower + spirit * treeOfLife
  const extraDirect = effectiveHealingPower * DIRECT_COEFFICIENT

  return Math.round((baseDirect + extraDirect) * giftOfNature)
}

export function getRegrowthHealPerTick(spirit, healingpower, talents) {
  const { treeOfLife, giftOfNature, empoweredRejuvenation } = talents
  const [HOT_SHARE] = _getRegrowthCoeffients()
  const HOT_COEFFICIENT = HOT_SHARE * empoweredRejuvenation
  const TICKS = 7

  const baseHoT = 1274
  const effectiveHealingPower = healingpower + spirit * treeOfLife
  const extraHoT = effectiveHealingPower * HOT_COEFFICIENT

  return Math.round(((baseHoT + extraHoT) / TICKS) * giftOfNature)
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
