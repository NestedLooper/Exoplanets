import { planetSeed, planetSeedNorm } from '@/lib/seed'

describe('planetSeed', () => {
  it('returns a positive integer for any string', () => {
    expect(planetSeed('Kepler-442 b')).toBeGreaterThan(0)
  })

  it('returns the same value for the same input', () => {
    expect(planetSeed('Kepler-442 b')).toBe(planetSeed('Kepler-442 b'))
  })

  it('returns different values for different inputs', () => {
    expect(planetSeed('Kepler-442 b')).not.toBe(planetSeed('Kepler-452 b'))
  })

  it('planetSeedNorm returns a float in 0..1 range', () => {
    const v = planetSeedNorm('Kepler-442 b')
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(1)
  })
})
