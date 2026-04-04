import { fetchAllStarPositions } from '@/lib/tap'
import { StarMap } from '@/components/three/StarMap'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Star Map — Exoplanets' }

interface Props { searchParams: Promise<{ highlight?: string }> }

export default async function MapPage({ searchParams }: Props) {
  const sp = await searchParams
  const allStars = await fetchAllStarPositions()
  // Filter to ensure no null ra/dec/sy_dist values (SQL filters them, but TypeScript doesn't trust it)
  const stars = allStars.filter((s): s is typeof s & { ra: number; dec: number; sy_dist: number } =>
    s.ra != null && s.dec != null && s.sy_dist != null
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Star Map</h1>
        <p className="text-sm text-slate-400">
          {stars.length.toLocaleString()} known exoplanet host stars relative to Earth.
          Drag to rotate · Scroll to zoom · Click any star to explore.
        </p>
      </div>
      <div className="h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-slate-800 bg-[#03030f]">
        <StarMap stars={stars} highlight={sp.highlight} />
      </div>
    </div>
  )
}
