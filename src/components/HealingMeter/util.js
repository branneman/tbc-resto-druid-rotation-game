export function formatHealing(n) {
  if (n >= 100_000_000) return Math.round(n / 1_000_000) + 'M'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 100_000) return Math.round(n / 1_000) + 'K'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(Math.round(n))
}
