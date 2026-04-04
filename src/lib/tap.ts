import { classifyPlanet } from './classify'
import type { PlanetData, FilterParams, StarData } from '@/types/planet'

const BASE_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

const PLANET_FIELDS = [
  'pl_name', 'hostname', 'pl_letter', 'pl_rade', 'pl_bmasse', 'pl_dens',
  'pl_eqt', 'pl_insol', 'pl_orbper', 'pl_orbsmax', 'pl_orbeccen',
  'disc_year', 'discoverymethod', 'disc_facility', 'sy_dist',
  'ra', 'dec', 'st_spectype', 'st_teff', 'st_rad',
].join(',')

const STAR_POSITION_FIELDS = 'hostname,ra,dec,sy_dist,st_spectype,st_teff,st_rad'

export const PAGE_SIZE = 24

async function tapQuery<T>(adql: string): Promise<T[]> {
  const url = `${BASE_URL}?query=${encodeURIComponent(adql)}&format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit)
  if (!res.ok) throw new Error(`TAP API error: ${res.status}`)
  return res.json()
}

function attachType(planet: PlanetData): PlanetData {
  return { ...planet, planetType: classifyPlanet(planet) }
}

export async function fetchPlanets(filters: FilterParams): Promise<PlanetData[]> {
  const conditions: string[] = ['pl_controv_flag = 0']

  if (filters.q) {
    const escaped = filters.q.replace(/'/g, "''")
    conditions.push(`pl_name LIKE '%${escaped}%'`)
  }
  if (filters.tempMin != null) conditions.push(`pl_eqt >= ${filters.tempMin}`)
  if (filters.tempMax != null) conditions.push(`pl_eqt <= ${filters.tempMax}`)
  if (filters.radiusMin != null) conditions.push(`pl_rade >= ${filters.radiusMin}`)
  if (filters.radiusMax != null) conditions.push(`pl_rade <= ${filters.radiusMax}`)
  if (filters.year != null) conditions.push(`disc_year = ${filters.year}`)
  if (filters.cursor) {
    const escaped = filters.cursor.replace(/'/g, "''")
    conditions.push(`pl_name > '${escaped}'`)
  }

  const where = conditions.join(' AND ')
  const adql = `SELECT TOP ${PAGE_SIZE} ${PLANET_FIELDS} FROM pscomppars WHERE ${where} ORDER BY pl_name`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.map(attachType)
}

export async function fetchPlanet(name: string): Promise<PlanetData | null> {
  const escaped = name.replace(/'/g, "''")
  const adql = `SELECT ${PLANET_FIELDS} FROM pscomppars WHERE pl_name = '${escaped}'`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.length > 0 ? attachType(rows[0]) : null
}

export async function fetchStar(hostname: string): Promise<StarData | null> {
  const escaped = hostname.replace(/'/g, "''")
  const adql = `SELECT ${PLANET_FIELDS} FROM pscomppars WHERE hostname = '${escaped}' ORDER BY pl_letter`
  const rows = await tapQuery<PlanetData>(adql)
  if (rows.length === 0) return null
  const first = rows[0]
  return {
    hostname: first.hostname,
    ra: first.ra,
    dec: first.dec,
    sy_dist: first.sy_dist,
    st_spectype: first.st_spectype,
    st_teff: first.st_teff,
    st_rad: first.st_rad,
    planets: rows.map(attachType),
  }
}

export async function fetchAllStarPositions(): Promise<Pick<PlanetData, 'hostname' | 'ra' | 'dec' | 'sy_dist' | 'st_spectype'>[]> {
  const adql = `SELECT ${STAR_POSITION_FIELDS} FROM pscomppars WHERE sy_dist IS NOT NULL AND ra IS NOT NULL AND dec IS NOT NULL`
  return tapQuery(adql)
}

export async function fetchPlanetOfTheDay(): Promise<PlanetData | null> {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const offset = dayOfYear % 5500
  const adql = `SELECT TOP 1 ${PLANET_FIELDS} FROM pscomppars WHERE pl_controv_flag = 0 AND pl_rade IS NOT NULL ORDER BY pl_name OFFSET ${offset} ROWS`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.length > 0 ? attachType(rows[0]) : null
}
