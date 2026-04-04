'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PlanetCard } from './PlanetCard'
import { FilterBar } from './FilterBar'
import type { PlanetData, FilterParams } from '@/types/planet'

interface PlanetGridProps {
  planets: PlanetData[]
  filters: FilterParams
  hasMore: boolean
}

export function PlanetGrid({ planets, filters, hasMore }: PlanetGridProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters)

  const loadMore = () => {
    if (planets.length === 0) return
    const lastName = planets[planets.length - 1].pl_name
    const params = new URLSearchParams(searchParams.toString())
    params.set('cursor', lastName)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterBar filters={localFilters} onChange={setLocalFilters} />

      {planets.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No planets match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {planets.map((planet) => (
            <PlanetCard key={planet.pl_name} planet={planet} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="rounded-lg border border-slate-700 bg-slate-900 px-6 py-2 text-sm text-slate-300 transition hover:border-blue-600 hover:text-white"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
