import { fetchPlanets, fetchPlanet, fetchStar, fetchAllStarPositions } from '@/lib/tap'

const mockPlanet = {
  pl_name: 'Kepler-442 b', hostname: 'Kepler-442', pl_letter: 'b',
  pl_rade: 1.34, pl_bmasse: 2.3, pl_dens: 6.3, pl_eqt: 233, pl_insol: 0.7,
  pl_orbper: 112.3, pl_orbsmax: 0.409, pl_orbeccen: null, disc_year: 2015,
  discoverymethod: 'Transit', disc_facility: 'Kepler', sy_dist: 342,
  ra: 280.6, dec: 39.3, st_spectype: 'K', st_teff: 4402, st_rad: 0.598,
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [mockPlanet],
  } as unknown as Response)
})

afterEach(() => jest.resetAllMocks())

describe('fetchPlanets', () => {
  it('calls TAP API with correct URL', async () => {
    await fetchPlanets({})
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('exoplanetarchive.ipac.caltech.edu'),
      expect.any(Object)
    )
  })

  it('returns array of planets with planetType attached', async () => {
    const results = await fetchPlanets({})
    expect(results).toHaveLength(1)
    expect(results[0].pl_name).toBe('Kepler-442 b')
    expect(results[0].planetType).toBeDefined()
  })

  it('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 } as unknown as Response)
    await expect(fetchPlanets({})).rejects.toThrow('TAP API error: 500')
  })
})

describe('fetchPlanet', () => {
  it('returns single planet by name', async () => {
    const planet = await fetchPlanet('Kepler-442 b')
    expect(planet?.pl_name).toBe('Kepler-442 b')
  })

  it('returns null when not found', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response)
    const planet = await fetchPlanet('Unknown Planet')
    expect(planet).toBeNull()
  })
})
