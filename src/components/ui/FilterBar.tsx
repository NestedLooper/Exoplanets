'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { FilterParams, PlanetType } from '@/types/planet'

const PLANET_TYPES: { value: PlanetType | ''; label: string }[] = [
  { value: '',             label: 'All Types' },
  { value: 'rocky',       label: 'Rocky' },
  { value: 'earth-like',  label: 'Earth-like' },
  { value: 'ocean-world', label: 'Ocean World' },
  { value: 'sub-neptune', label: 'Sub-Neptune' },
  { value: 'gas-giant',   label: 'Gas Giant' },
  { value: 'hot-jupiter', label: 'Hot Jupiter' },
]

const TEMP_RANGES = [
  { value: '',            label: 'Any Temp' },
  { value: '0-200',       label: '< 200 K (Frozen)' },
  { value: '200-400',     label: '200–400 K (Habitable)' },
  { value: '400-1000',    label: '400–1000 K (Hot)' },
  { value: '1000-99999',  label: '> 1000 K (Extreme)' },
]

interface FilterBarProps {
  filters: FilterParams
  onChange: (filters: FilterParams) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value); else params.delete(key)
      params.delete('cursor')
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
      <input
        type="search"
        placeholder="Search planets…"
        aria-label="Search"
        value={filters.q ?? ''}
        onChange={(e) => {
          updateParam('q', e.target.value)
          onChange({ ...filters, q: e.target.value || undefined, cursor: undefined })
        }}
        className="min-w-[180px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />

      <select
        aria-label="Type"
        value={filters.type ?? ''}
        onChange={(e) => {
          updateParam('type', e.target.value)
          onChange({ ...filters, type: (e.target.value as PlanetType) || undefined, cursor: undefined })
        }}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {PLANET_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        aria-label="Temperature"
        value={
          filters.tempMin != null
            ? `${filters.tempMin}-${filters.tempMax ?? 99999}`
            : ''
        }
        onChange={(e) => {
          const val = e.target.value
          if (val) {
            const [min, max] = val.split('-').map(Number)
            updateParam('tempMin', String(min))
            updateParam('tempMax', String(max))
            onChange({ ...filters, tempMin: min, tempMax: max, cursor: undefined })
          } else {
            updateParam('tempMin', '')
            updateParam('tempMax', '')
            onChange({ ...filters, tempMin: undefined, tempMax: undefined, cursor: undefined })
          }
        }}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {TEMP_RANGES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}
