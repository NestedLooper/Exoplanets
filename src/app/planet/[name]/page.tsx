import { notFound } from 'next/navigation'
import { fetchPlanet } from '@/lib/tap'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Planet } from '@/components/three/Planet'
import { StatPanel } from '@/components/ui/StatPanel'
import type { Metadata } from 'next'

interface Props { params: Promise<{ name: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return { title: `${decoded} — Exoplanets` }
}

export default async function PlanetPage({ params }: Props) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const planet = await fetchPlanet(decoded)
  if (!planet) notFound()

  const type = planet.planetType ?? 'unknown'

  return (
    <>
    {/* Height = viewport minus nav bar (73px: py-4 + text + border ≈ 73px) */}
    <div className="flex h-[calc(100vh-73px)] overflow-hidden rounded-2xl border border-slate-800">
      {/* Left: 3D viewer — 60% width, fills height */}
      <div className="relative flex-[3] bg-[#03030f]">
        <PlanetScene hostSpecType={planet.st_spectype} fill className="absolute inset-0">
          <Planet
            name={planet.pl_name}
            type={type}
            temp={planet.pl_eqt ?? 300}
            large
          />
        </PlanetScene>
      </div>

      {/* Right: Stats panel — 40% width, flex column so header never scrolls */}
      <div className="flex flex-[2] flex-col overflow-hidden border-l border-slate-800 bg-slate-950">
        <StatPanel planet={planet} />
      </div>
    </div>
    </>
  )
}
