import Link from 'next/link'

interface HostStarCardProps {
  hostname: string
  specType?: string | null
  teff?: number | null
  dist?: number | null
}

export function HostStarCard({ hostname, specType, teff, dist }: HostStarCardProps) {
  return (
    <Link
      href={`/star/${encodeURIComponent(hostname)}`}
      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition hover:border-blue-600"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
        <span className="text-lg">⭐</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-blue-400">{hostname} ↗</p>
        <p className="text-xs text-slate-500">
          {specType ?? '?'}
          {teff != null ? ` · ${teff} K` : ''}
          {dist != null ? ` · ${Math.round(dist * 3.26)} ly` : ''}
        </p>
      </div>
    </Link>
  )
}
