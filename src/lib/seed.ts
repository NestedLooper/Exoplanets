/**
 * djb2 hash — deterministic integer from a string.
 * Same planet name always yields the same seed.
 */
export function planetSeed(name: string): number {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33) ^ name.charCodeAt(i)
    hash = hash >>> 0 // keep as unsigned 32-bit
  }
  return hash || 1 // never return 0
}

/** Normalised 0..1 version of the seed for use as a GLSL uniform */
export function planetSeedNorm(name: string): number {
  return (planetSeed(name) % 10000) / 10000
}
