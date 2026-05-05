const TALENT_PRESETS = {
  full_resto: {
    intensity: 0.3, // 3/3 Intensity: 30% spirit regen while casting
    dreamstate: 0, // no Dreamstate talent
  },
  // https://www.wowhead.com/tbc/talent-calc/druid/5123220120331302303--500233510114
  dreamstate: {
    intensity: 0.3, // 3/3 Intensity: 30% spirit regen while casting
    dreamstate: 0.06, // 3/3 Dreamstate: 6% of Intellect per 5 s
  },
}

// Returns mana regenerated per millisecond.
// inFiveSR: true when a mana-spending cast occurred within the last 5 seconds.
export function getManaRegenPerMs(spirit, intellect, mp5, talents, inFiveSR) {
  const { intensity, dreamstate } = TALENT_PRESETS[talents]

  const spiritRegenPerMs = (0.009327 * Math.sqrt(intellect) * spirit) / 1000
  const activeSpiritRegen = inFiveSR
    ? spiritRegenPerMs * intensity
    : spiritRegenPerMs

  const dreamstateRegenPerMs = (dreamstate * intellect) / 5000
  const mp5RegenPerMs = mp5 / 5000

  return activeSpiritRegen + dreamstateRegenPerMs + mp5RegenPerMs
}
