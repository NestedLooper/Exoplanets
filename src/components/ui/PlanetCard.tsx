import Link from 'next/link'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Planet } from '@/components/three/Planet'
import type { PlanetData, PlanetType } from '@/types/planet'

const TYPE_BADGE: Record<PlanetType, { label: string; className: string }> = {
  'hot-jupiter':  { label: 'Hot Jupiter',  className: 'bg-red-950 text-red-300' },
  'gas-giant':    { label: 'Gas Giant',    className: 'bg-amber-950 text-amber-300' },
  'sub-neptune':  { label: 'Sub-Neptune',  className: 'bg-blue-950 text-blue-300' },
  'earth-like':   { label: 'Earth-like',   className: 'bg-green-950 text-green-300' },
  'ocean-world':  { label: 'Ocean World',  className: 'bg-cyan-950 text-cyan-300' },
  'rocky':        { label: 'Rocky',        className: 'bg-stone-800 text-stone-300' },
  'unknown':      { label: 'Unknown',      className: 'bg-slate-800 text-slate-400' },
}

export function PlanetCard({ planet }: { planet: PlanetData }) {
  const type  = planet.planetType ?? 'unknown'
  const badge = TYPE_BADGE[type]
  const href  = `/planet/${encodeURIComponent(planet.pl_name)}`

  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-600 hover:bg-slate-900"
    >
      <PlanetScene hostSpecType={planet.st_spectype}>
        <Planet
          name={planet.pl_name}
          type={type}
          temp={planet.pl_eqt ?? 300}
        />
      </PlanetScene>

      <p className="text-center text-sm font-semibold text-slate-200 group-hover:text-white">
        {planet.pl_name}
      </p>

      <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>

      <div className="flex w-full justify-between text-xs text-slate-500">
        <span>{planet.pl_rade != null ? `${planet.pl_rade} R⊕` : '—'}</span>
        <span>{planet.pl_eqt != null ? `${planet.pl_eqt} K` : '—'}</span>
      </div>
    </Link>
  )
}
