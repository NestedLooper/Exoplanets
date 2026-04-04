export type PlanetType =
  | 'hot-jupiter'
  | 'gas-giant'
  | 'sub-neptune'
  | 'earth-like'
  | 'ocean-world'
  | 'rocky'
  | 'unknown'

export interface PlanetData {
  pl_name: string
  hostname: string
  pl_letter: string | null
  pl_rade: number | null       // radius in Earth radii
  pl_bmasse: number | null     // mass in Earth masses
  pl_dens: number | null       // density g/cm³
  pl_eqt: number | null        // equilibrium temperature K
  pl_insol: number | null      // insolation flux (Earth = 1)
  pl_orbper: number | null     // orbital period days
  pl_orbsmax: number | null    // semi-major axis au
  pl_orbeccen: number | null   // eccentricity
  disc_year: number | null
  discoverymethod: string | null
  disc_facility: string | null
  sy_dist: number | null       // distance in parsecs
  ra: number | null            // right ascension degrees
  dec: number | null           // declination degrees
  st_spectype: string | null   // e.g. "G2V"
  st_teff: number | null       // stellar effective temp K
  st_rad: number | null        // stellar radius solar radii
  // Derived fields (added by classify)
  planetType?: PlanetType
}

export interface StarData {
  hostname: string
  ra: number | null
  dec: number | null
  sy_dist: number | null
  st_spectype: string | null
  st_teff: number | null
  st_rad: number | null
  planets: PlanetData[]
}

export interface FilterParams {
  type?: PlanetType
  tempMin?: number
  tempMax?: number
  radiusMin?: number
  radiusMax?: number
  year?: number
  q?: string
  cursor?: string   // last pl_name for cursor pagination
}
