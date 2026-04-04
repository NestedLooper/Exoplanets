import { classifyPlanet } from '@/lib/classify'

describe('classifyPlanet', () => {
  it('classifies Hot Jupiter by radius alone', () => {
    expect(classifyPlanet({ pl_rade: 12, pl_eqt: 500 })).toBe('hot-jupiter')
  })

  it('classifies Hot Jupiter by high temp + large radius', () => {
    expect(classifyPlanet({ pl_rade: 5, pl_eqt: 1500 })).toBe('hot-jupiter')
  })

  it('classifies Gas Giant', () => {
    expect(classifyPlanet({ pl_rade: 8, pl_bmasse: 300, pl_eqt: 400 })).toBe('gas-giant')
  })

  it('classifies cool large planet as Gas Giant, not Hot Jupiter', () => {
    expect(classifyPlanet({ pl_rade: 8, pl_bmasse: 300, pl_eqt: 400 })).toBe('gas-giant')
  })

  it('classifies Sub-Neptune', () => {
    expect(classifyPlanet({ pl_rade: 3, pl_dens: 2 })).toBe('sub-neptune')
  })

  it('classifies Earth-like', () => {
    expect(classifyPlanet({ pl_rade: 1.5, pl_insol: 0.9 })).toBe('earth-like')
  })

  it('classifies Ocean World', () => {
    expect(classifyPlanet({ pl_rade: 2, pl_dens: 3, pl_eqt: 350 })).toBe('ocean-world')
  })

  it('classifies Rocky', () => {
    expect(classifyPlanet({ pl_rade: 1.1, pl_dens: 5.5 })).toBe('rocky')
  })

  it('returns unknown when data is insufficient', () => {
    expect(classifyPlanet({})).toBe('unknown')
    expect(classifyPlanet({ pl_rade: 2 })).toBe('unknown')
  })

  it('Hot Jupiter takes priority over Gas Giant', () => {
    expect(classifyPlanet({ pl_rade: 10, pl_bmasse: 300, pl_eqt: 1200 })).toBe('hot-jupiter')
  })
})
