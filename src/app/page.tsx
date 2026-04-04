import { fetchPlanetOfTheDay, fetchPlanets, PAGE_SIZE } from '@/lib/tap'
import { HeroPlanet } from '@/components/ui/HeroPlanet'
import { PlanetGrid } from '@/components/ui/PlanetGrid'
import type { FilterParams, PlanetType } from '@/types/planet'

const VALID_TYPES: PlanetType[] = ['rocky', 'ocean-world', 'earth-like', 'sub-neptune', 'gas-giant', 'hot-jupiter', 'unknown']

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams

  const rawType = sp.type
  const type = VALID_TYPES.includes(rawType as PlanetType) ? (rawType as PlanetType) : undefined

  const filters: FilterParams = {
    q:          sp.q,
    type,
    tempMin:    sp.tempMin ? Number(sp.tempMin) : undefined,
    tempMax:    sp.tempMax ? Number(sp.tempMax) : undefined,
    radiusMin:  sp.radiusMin ? Number(sp.radiusMin) : undefined,
    radiusMax:  sp.radiusMax ? Number(sp.radiusMax) : undefined,
    year:       sp.year ? Number(sp.year) : undefined,
    cursor:     sp.cursor,
  }

  const [hero, planets] = await Promise.all([
    fetchPlanetOfTheDay(),
    fetchPlanets(filters),
  ])

  const hasMore = planets.length === PAGE_SIZE
  const randomPlanet = planets.length > 0
    ? planets[Math.floor(Math.random() * planets.length)]
    : null

  return (
    <div className="flex flex-col gap-10">
      {hero && <HeroPlanet planet={hero} randomPlanetName={randomPlanet?.pl_name} />}
      <PlanetGrid planets={planets} filters={filters} hasMore={hasMore} />
    </div>
  )
}
