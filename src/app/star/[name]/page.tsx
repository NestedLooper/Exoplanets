import { notFound } from 'next/navigation'
import { fetchStar } from '@/lib/tap'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Star } from '@/components/three/Star'
import { PlanetCard } from '@/components/ui/PlanetCard'
import { SkyWidget } from '@/components/ui/SkyWidget'
import type { Metadata } from 'next'

interface Props { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return { title: `${decoded} — Exoplanets` }
}

export default async function StarPage({ params }: Props) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const star = await fetchStar(decoded)
  if (!star) notFound()

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden rounded-2xl border border-slate-800">
      {/* Left: 3D star viewer */}
      <div className="relative flex-[3] bg-[#03030f]">
        <PlanetScene hostSpecType={star.st_spectype} fill className="absolute inset-0">
          <Star specType={star.st_spectype} large />
        </PlanetScene>
      </div>

      {/* Right: Star stats */}
      <div className="flex flex-[2] flex-col gap-6 overflow-y-auto border-l border-slate-800 bg-slate-950 px-6 py-6">
        <div>
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300">← Back</a>
          <h1 className="mt-1 text-2xl font-bold text-white">{star.hostname}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {star.st_spectype ?? 'Unknown type'} star
            {star.sy_dist != null ? ` · ${Math.round(star.sy_dist * 3.26)} light years away` : ''}
          </p>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-blue-400">Stellar Properties</p>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Spectral Type</span><span className="text-slate-300">{star.st_spectype ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Effective Temp</span><span className="text-slate-300">{star.st_teff != null ? `${star.st_teff} K` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Radius</span><span className="text-slate-300">{star.st_rad != null ? `${star.st_rad} R☉` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Distance</span><span className="text-slate-300">{star.sy_dist != null ? `${(star.sy_dist * 3.26).toFixed(0)} ly` : '—'}</span></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-blue-400">
            Known Planets ({star.planets.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {star.planets.map((planet) => (
              <div key={planet.pl_name} className="w-36 shrink-0">
                <PlanetCard planet={planet} />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-widest text-blue-400">Location</p>
          <SkyWidget ra={star.ra} dec={star.dec} hostname={star.hostname} />
          <a
            href={`/map?highlight=${encodeURIComponent(star.hostname)}`}
            className="mt-2 block text-xs text-blue-400 hover:underline"
          >
            View on star map →
          </a>
        </div>
      </div>
    </div>
  )
}
