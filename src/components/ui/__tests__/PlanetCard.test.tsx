import React from 'react'
import { render, screen } from '@testing-library/react'
import { PlanetCard } from '../PlanetCard'
import type { PlanetData } from '@/types/planet'

jest.mock('@/components/three/PlanetScene', () => ({
  PlanetScene: ({ children }: { children: React.ReactNode }) => <div data-testid="planet-scene">{children}</div>,
}))
jest.mock('@/components/three/Planet', () => ({
  Planet: () => <div data-testid="planet-mesh" />,
}))

const mockPlanet: PlanetData = {
  pl_name: 'Kepler-442 b', hostname: 'Kepler-442', pl_letter: 'b',
  pl_rade: 1.34, pl_bmasse: null, pl_dens: null, pl_eqt: 233, pl_insol: 0.7,
  pl_orbper: 112.3, pl_orbsmax: null, pl_orbeccen: null, disc_year: 2015,
  discoverymethod: 'Transit', disc_facility: 'Kepler', sy_dist: 342,
  ra: null, dec: null, st_spectype: 'K', st_teff: null, st_rad: null,
  planetType: 'earth-like',
}

describe('PlanetCard', () => {
  it('renders planet name', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByText('Kepler-442 b')).toBeInTheDocument()
  })

  it('renders type badge', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByText(/earth-like/i)).toBeInTheDocument()
  })

  it('renders radius stat', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByText(/1\.34/)).toBeInTheDocument()
  })

  it('links to planet detail page', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/planet/Kepler-442%20b')
  })
})
