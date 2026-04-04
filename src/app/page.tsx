import { fetchPlanetOfTheDay, fetchPlanets } from '@/lib/tap'
import { HeroPlanet } from '@/components/ui/HeroPlanet'
import { PlanetGrid } from '@/components/ui/PlanetGrid'
import type { FilterParams } from '@/types/planet'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams

  const filters: FilterParams = {
    q:          sp.q,
    type:       sp.type as FilterParams['type'],
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

  const hasMore = planets.length === 24

  return (
    <div className="flex flex-col gap-10">
      {hero && <HeroPlanet planet={hero} />}
      <PlanetGrid planets={planets} filters={filters} hasMore={hasMore} />
    </div>
  )
}
