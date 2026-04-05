import Link from 'next/link'
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

// Sphere-like radial gradient per planet type — highlight at top-left, dark at bottom-right
const TYPE_GRADIENT: Record<PlanetType, string> = {
  'hot-jupiter':  'radial-gradient(circle at 35% 30%, #ff9a6c, #c43a1a, #4a0808)',
  'gas-giant':    'radial-gradient(circle at 35% 30%, #f0d080, #c48020, #5c3800)',
  'sub-neptune':  'radial-gradient(circle at 35% 30%, #90c8f0, #3a70b8, #102848)',
  'earth-like':   'radial-gradient(circle at 35% 30%, #80c870, #2878c0, #103050)',
  'ocean-world':  'radial-gradient(circle at 35% 30%, #60d8c0, #1898a0, #084840)',
  'rocky':        'radial-gradient(circle at 35% 30%, #b09880, #786050, #382820)',
  'unknown':      'radial-gradient(circle at 35% 30%, #808898, #4a5060, #1e2028)',
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
      {/* Planet thumbnail — CSS sphere */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Starfield backdrop */}
        <div className="absolute inset-0 rounded-lg bg-[#03030f]" />
        {/* Planet sphere */}
        <div
          className="relative h-16 w-16 rounded-full shadow-lg"
          style={{ background: TYPE_GRADIENT[type] }}
        />
      </div>

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
