'use client'

import Link from 'next/link'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Planet } from '@/components/three/Planet'
import type { PlanetData } from '@/types/planet'

const TYPE_LABELS: Record<string, string> = {
  'hot-jupiter': 'Hot Jupiter', 'gas-giant': 'Gas Giant',
  'sub-neptune': 'Sub-Neptune', 'earth-like': 'Earth-like',
  'ocean-world': 'Ocean World', 'rocky': 'Rocky', 'unknown': 'Unknown',
}

interface HeroPlanetProps {
  planet: PlanetData
  randomPlanetName?: string
}

export function HeroPlanet({ planet, randomPlanetName }: HeroPlanetProps) {
  const type = planet.planetType ?? 'unknown'
  const href = `/planet/${encodeURIComponent(planet.pl_name)}`

  return (
    <div className="relative flex min-h-[420px] items-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* 3D planet — left half, full height */}
      <div className="h-[420px] w-1/2 shrink-0">
        <PlanetScene hostSpecType={planet.st_spectype} fill className="h-full w-full">
          <Planet name={planet.pl_name} type={type} temp={planet.pl_eqt ?? 300} large />
        </PlanetScene>
      </div>

      {/* Info — right half */}
      <div className="flex flex-col gap-4 px-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          ✦ Planet of the Day
        </p>
        <h1 className="text-4xl font-bold text-white">{planet.pl_name}</h1>
        <p className="text-slate-400">
          {TYPE_LABELS[type]} · {planet.hostname}
          {planet.sy_dist != null
            ? ` · ${Math.round(planet.sy_dist * 3.26)} ly away`
            : ''}
        </p>

        <div className="flex gap-8 py-2">
          {planet.pl_rade != null && (
            <div>
              <p className="text-xl font-semibold text-slate-200">{planet.pl_rade} R⊕</p>
              <p className="text-xs text-slate-500">Radius</p>
            </div>
          )}
          {planet.pl_eqt != null && (
            <div>
              <p className="text-xl font-semibold text-slate-200">{planet.pl_eqt} K</p>
              <p className="text-xs text-slate-500">Eq. Temp</p>
            </div>
          )}
          {planet.pl_orbper != null && (
            <div>
              <p className="text-xl font-semibold text-slate-200">
                {planet.pl_orbper.toFixed(1)}d
              </p>
              <p className="text-xs text-slate-500">Period</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href={href}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Explore Planet →
          </Link>
          <Link
            href={randomPlanetName ? `/planet/${encodeURIComponent(randomPlanetName)}` : '/'}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            ✦ Random
          </Link>
        </div>
      </div>
    </div>
  )
}
