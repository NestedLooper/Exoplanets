# Exoplanet Viewer — Design Spec
**Date:** 2026-04-04  
**Stack:** Next.js (App Router) · react-three-fiber · @react-three/drei · TypeScript  
**Data:** NASA Exoplanet Archive TAP API

---

## Overview

A Next.js web app that pulls confirmed exoplanet data from the NASA Exoplanet Archive TAP API and renders each planet as a realistic, data-driven 3D model in Three.js. Users can browse, search, and filter planets; explore individual planet and star detail pages; and navigate an interactive 3D star map showing all known systems relative to Earth.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing + browse page — hero featured planet + paginated planet card grid |
| `/planet/[name]` | Planet detail — large 3D viewer, grouped stats panel, host star card, sky widget |
| `/star/[name]` | Star detail — 3D star render, stellar stats, list of its known planets |
| `/map` | Interactive 3D star neighborhood — all known systems relative to Earth |

---

## Data Layer

### Source
NASA Exoplanet Archive TAP API:  
`https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=...&format=json`

**Table:** `pscomppars` (composite parameters — one best row per planet)

### Fields fetched

| Field | Description |
|---|---|
| `pl_name` | Planet name |
| `hostname` | Host star name |
| `pl_letter` | Planet letter (b, c, d…) |
| `pl_rade` | Planet radius (Earth radii) |
| `pl_bmasse` | Planet mass (Earth masses) |
| `pl_dens` | Planet density (g/cm³) |
| `pl_eqt` | Equilibrium temperature (K) |
| `pl_insol` | Insolation flux (Earth flux) |
| `pl_orbper` | Orbital period (days) |
| `pl_orbsmax` | Semi-major axis (au) |
| `pl_orbeccen` | Orbital eccentricity |
| `disc_year` | Discovery year |
| `discoverymethod` | Discovery method |
| `disc_facility` | Discovery facility |
| `sy_dist` | Distance from Earth (parsecs) |
| `ra` | Right ascension |
| `dec` | Declination |
| `st_spectype` | Stellar spectral type |
| `st_teff` | Stellar effective temperature (K) |
| `st_rad` | Stellar radius (Solar radii) |

### Fetching strategy
All TAP API calls happen in **Next.js Server Components** — no client-side fetching, no CORS issues. Next.js caches responses automatically. Planet type classification runs server-side before data reaches the client.

### Filters (URL search params)
Filters are encoded as URL search params so results are bookmarkable and shareable.

| Param | Values |
|---|---|
| `type` | rocky, ocean, earthlike, subneptune, gasgiant, hotjupiter |
| `tempMin` / `tempMax` | Kelvin range |
| `radiusMin` / `radiusMax` | Earth radii range |
| `year` | Discovery year |
| `q` | Planet name search string |

---

## Planet Classification (`lib/classify.ts`)

Evaluated in priority order (first match wins):

| Type | Criteria |
|---|---|
| **Hot Jupiter** | `pl_rade > 6` OR (`pl_eqt > 1000K` AND `pl_rade > 4`) |
| **Gas Giant** | `pl_rade > 4` AND `pl_bmasse > 50` |
| **Sub-Neptune** | `pl_rade` 2–4 AND `pl_dens < 3` |
| **Earth-like** | `pl_rade` 1–2.5 AND `pl_insol` 0.25–1.5 F⊕ |
| **Ocean World** | `pl_rade` 1.5–2.5 AND `pl_dens < 4` AND `pl_eqt < 500K` |
| **Rocky** | `pl_rade < 1.5` AND `pl_dens > 4` |
| **Unknown** | Insufficient data — renders as grey rocky sphere |

---

## Planet Seed System (`lib/seed.ts`)

Each planet's name is hashed to a deterministic integer using the djb2 algorithm. This seed is passed to every GLSL shader as a uniform, ensuring:
- The same planet always looks identical across visits
- No two planets share the same terrain, band pattern, storm position, or cloud layout

---

## Three.js Component System

### `<PlanetScene>`
Shared canvas wrapper used on all pages. Provides:
- Animated starfield (`<Stars />` from drei)
- Directional light angled from the host star's position, color-matched to stellar spectral type (O/B=blue-white, G=yellow, K=orange, M=red)
- Ambient fill light
- `<OrbitControls />` for drag-to-rotate and scroll-to-zoom
- Slow auto-rotation (pauses when user interacts)

### `<Planet type radius temp density insolation seed />`
- `THREE.SphereGeometry` with a custom `ShaderMaterial` selected by planet type
- Gas giants, ocean worlds, and earth-like planets get a second transparent sphere for the cloud/atmosphere layer
- Planet sphere diameter is sized to ~70% of canvas diameter on the detail page so it dominates the viewport
- On list cards, renders at 96×96px

### `<Star spectralType temp radius />`
- Glowing sphere with a corona bloom effect
- Color mapped from spectral class
- On the star detail page, renders large (same canvas dimensions as planet detail)

### GLSL Shaders (`components/three/shaders/`)

All shaders are procedural — no image texture files. Terrain and patterns are generated via FBM (fractal Brownian motion) noise in GLSL, seeded from the planet name hash.

| File | Planet type | Key effects |
|---|---|---|
| `rocky.glsl` | Rocky | FBM terrain, crater overlay, ice caps if temp < 200K, lava cracks if temp > 1000K |
| `gas-giant.glsl` | Gas Giant | Horizontal band shader, turbulence distortion, procedural storm spot |
| `hot-jupiter.glsl` | Hot Jupiter | Heat gradient (star-facing glow), ablation rim, banding |
| `ocean.glsl` | Ocean World | Ocean specular highlights, polar ice caps from eq. temp |
| `earth-like.glsl` | Earth-like | Continent/ocean FBM, mountain elevation tinting, polar ice caps |
| `sub-neptune.glsl` | Sub-Neptune | Neptune-blue banding, haze atmosphere layer |

Cloud sphere (separate transparent `THREE.Sphere`, slightly larger radius):
- Used by: Ocean World, Earth-like
- Animated rotation independent of planet body
- FBM cloud density, lit by same directional light

---

## Landing Page (`/`)

Styled after a "hero + browse" pattern (similar to Zillow's listing pages):

**Hero section:**
- Full-width dark starfield background
- Large rotating 3D planet (planet of the day, seeded by current date)
- Planet name, type badge, 3 key stats (radius, temp, distance)
- "Explore Planet" CTA + "Random Planet" button

**Browse section below hero:**
- Filter bar: Type dropdown, Temperature range, Radius range, Discovery Year, text search
- Paginated grid of `<PlanetCard>` components (4 columns desktop, 2 tablet, 1 mobile)
- Each card: 96×96 rotating 3D planet render, planet name, type badge, radius + temp

---

## Planet Detail Page (`/planet/[name]`)

**Layout:** two-column, full viewport height

**Left (60% width):** `<PlanetScene>` canvas, edge-to-edge, planet fills ~70% of canvas. No padding on the canvas edges — the planet bleeds toward the viewport.

**Right (40% width):** scrollable stats panel
- Planet name + type badge in a sticky header
- Back to results link
- Stats grouped in sections:
  - **Physical:** radius, mass, density, equilibrium temp
  - **Orbital:** period, semi-major axis, eccentricity, insolation flux
  - **Host Star:** name (link), spectral type, distance — plus a clickable star preview card that navigates to `/star/[name]`
  - **Discovery:** year, method, facility
  - **Location:** mini 2D sky chart (RA/Dec dot on circular all-sky projection, constellation label) + "View on star map →" link to `/map?highlight=[hostname]`

---

## Star Detail Page (`/star/[name]`)

Same two-column layout as planet detail. Left panel renders `<Star>` with corona effect. Right panel shows:
- Stellar stats: spectral type, temperature, radius, distance
- **Planets in this system:** horizontal scrollable row of mini planet cards, each linking to `/planet/[name]`
- Location widget (same sky chart as planet detail)

---

## Star Map Page (`/map`)

Interactive 3D scatter plot of all known exoplanet host stars plotted in true 3D space using RA/Dec/distance.

- Earth at center, rendered as a small blue sphere with label
- Stars plotted as colored dots (color from spectral type)
- Selected/highlighted star shown larger with a gold glow + dashed line to Earth
- Logarithmic distance scaling so nearby and distant systems are both visible
- Distance slider: 10 ly → 30,000 ly (log scale)
- Drag to rotate the entire neighborhood, scroll to zoom
- Click any star dot → navigates to `/star/[name]`
- Accepts `?highlight=[hostname]` param to pre-select a star (used from the location widget on detail pages)
- Kepler field of view visible as a dense streak of stars at ~1,000–3,000 ly in one direction

---

## Project File Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing + browse (Server Component)
│   ├── planet/[name]/page.tsx          # Planet detail (Server Component)
│   ├── star/[name]/page.tsx            # Star detail (Server Component)
│   └── map/page.tsx                    # Star map (Client Component)
├── components/
│   ├── three/
│   │   ├── PlanetScene.tsx             # Canvas + stars + lighting + controls
│   │   ├── Planet.tsx                  # Sphere + shader selector + cloud layer
│   │   ├── Star.tsx                    # Star sphere + corona glow
│   │   ├── StarMap.tsx                 # 3D scatter plot of all systems
│   │   └── shaders/
│   │       ├── rocky.glsl
│   │       ├── gas-giant.glsl
│   │       ├── hot-jupiter.glsl
│   │       ├── ocean.glsl
│   │       ├── earth-like.glsl
│   │       └── sub-neptune.glsl
│   ├── ui/
│   │   ├── PlanetCard.tsx              # Grid card (planet render + stats)
│   │   ├── PlanetGrid.tsx              # Paginated grid + filter bar
│   │   ├── FilterBar.tsx               # Dropdowns + search input
│   │   ├── HeroPlanet.tsx              # Landing page hero section
│   │   ├── StatPanel.tsx               # Grouped stats sidebar
│   │   ├── HostStarCard.tsx            # Clickable star preview in stat panel
│   │   └── SkyWidget.tsx              # Mini 2D sky chart + constellation label
├── lib/
│   ├── tap.ts                          # TAP API fetch helpers + TypeScript types
│   ├── classify.ts                     # Planet type classification logic
│   └── seed.ts                         # Planet name → numeric seed (djb2 hash)
└── types/
    └── planet.ts                       # Shared TypeScript interfaces
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers: Stars, OrbitControls, shaderMaterial |
| `three` | Core 3D engine |
| `next` | App framework (App Router) |
| `typescript` | Type safety |
