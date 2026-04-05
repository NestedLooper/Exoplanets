import Link from 'next/link'
import { HostStarCard } from './HostStarCard'
import { SkyWidget } from './SkyWidget'
import type { PlanetData } from '@/types/planet'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-xs text-slate-300">{value ?? '—'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-blue-400">{title}</p>
      {children}
      <div className="mt-1 border-t border-slate-800" />
    </div>
  )
}

export function StatPanel({ planet }: { planet: PlanetData }) {
  return (
    <div className="flex h-full flex-col">
      {/* Fixed header — lives outside the scroll container */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Back
          </Link>
          <h1 className="mt-1 text-lg font-bold text-white">{planet.pl_name}</h1>
        </div>
        <span className="rounded bg-slate-800 px-2 py-1 text-xs capitalize text-slate-300">
          {planet.planetType?.replace('-', ' ') ?? 'Unknown'}
        </span>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
      <Section title="Physical">
        <Row label="Radius"   value={planet.pl_rade != null ? `${planet.pl_rade} R⊕` : null} />
        <Row label="Mass"     value={planet.pl_bmasse != null ? `${planet.pl_bmasse} M⊕` : null} />
        <Row label="Density"  value={planet.pl_dens != null ? `${planet.pl_dens} g/cm³` : null} />
        <Row label="Eq. Temp" value={planet.pl_eqt != null ? `${planet.pl_eqt} K` : null} />
      </Section>

      <Section title="Orbital">
        <Row label="Period"       value={planet.pl_orbper != null ? `${planet.pl_orbper.toFixed(2)} days` : null} />
        <Row label="Semi-axis"    value={planet.pl_orbsmax != null ? `${planet.pl_orbsmax} au` : null} />
        <Row label="Eccentricity" value={planet.pl_orbeccen != null ? planet.pl_orbeccen.toFixed(3) : null} />
        <Row label="Insolation"   value={planet.pl_insol != null ? `${planet.pl_insol.toFixed(2)} F⊕` : null} />
      </Section>

      <Section title="Host Star">
        <HostStarCard
          hostname={planet.hostname}
          specType={planet.st_spectype}
          teff={planet.st_teff}
          dist={planet.sy_dist}
        />
      </Section>

      <Section title="Discovery">
        <Row label="Year"     value={planet.disc_year} />
        <Row label="Method"   value={planet.discoverymethod} />
        <Row label="Facility" value={planet.disc_facility} />
      </Section>

      <Section title="Location">
        <SkyWidget ra={planet.ra} dec={planet.dec} hostname={planet.hostname} />
        <div className="mt-1 flex items-center justify-between">
          <Link
            href={`/map?highlight=${encodeURIComponent(planet.hostname)}`}
            className="text-xs text-blue-400 hover:underline"
          >
            View on star map →
          </Link>
          <a
            href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            NASA Archive ↗
          </a>
        </div>
      </Section>
      </div>
    </div>
  )
}
