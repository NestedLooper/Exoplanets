import type { PlanetType } from '@/types/planet'

interface ClassifyInput {
  pl_rade?: number | null
  pl_bmasse?: number | null
  pl_dens?: number | null
  pl_eqt?: number | null
  pl_insol?: number | null
}

/** Priority-ordered classification from TAP data fields */
export function classifyPlanet(data: ClassifyInput): PlanetType {
  const r = data.pl_rade ?? null
  const m = data.pl_bmasse ?? null
  const d = data.pl_dens ?? null
  const t = data.pl_eqt ?? null
  const i = data.pl_insol ?? null

  // Hot Jupiter: very large (r > 8, no temp needed) OR large + hot OR medium-large + very hot
  if (
    r !== null &&
    (
      r > 8 ||
      (t !== null && r > 6 && t > 800) ||
      (t !== null && r > 4 && t > 1000)
    )
  ) return 'hot-jupiter'

  // Gas Giant: large and massive
  if (r !== null && m !== null && r > 4 && m > 50) return 'gas-giant'

  // Sub-Neptune: medium radius, low density
  if (r !== null && d !== null && r >= 2 && r <= 4 && d < 3) return 'sub-neptune'

  // Earth-like: small-medium in habitable zone (insol check first)
  if (r !== null && i !== null && r >= 1 && r <= 2.5 && i >= 0.25 && i <= 1.5) return 'earth-like'

  // Ocean World: medium, low density, cool
  if (r !== null && d !== null && t !== null && r >= 1.5 && r <= 2.5 && d < 4 && t < 500) return 'ocean-world'

  // Rocky: small and dense
  if (r !== null && d !== null && r < 1.5 && d > 4) return 'rocky'

  return 'unknown'
}
