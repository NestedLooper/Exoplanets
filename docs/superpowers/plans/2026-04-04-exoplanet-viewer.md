# Exoplanet Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app that fetches confirmed exoplanet data from the NASA Exoplanet Archive TAP API and renders each planet as a realistic, data-driven 3D Three.js model with a browse/search landing page, planet detail pages, star detail pages, and an interactive 3D star map.

**Architecture:** Next.js App Router with Server Components handling all TAP API fetches (no CORS, automatic caching). Three.js via react-three-fiber with custom GLSL shaders per planet type, all procedurally generated from a name-derived seed — no texture images. UI is dark-space aesthetic with rotating planets, drag-to-orbit controls, and a starfield background.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · react-three-fiber · @react-three/drei · three.js · Tailwind CSS · Jest · @testing-library/react

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `next.config.ts`
- Create: `src/glsl.d.ts`

- [ ] **Step 1: Create project**

```bash
cd /Users/chad/code/DEV/_Typescript/Exoplanets
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Expected: Next.js project scaffolded in current directory.

- [ ] **Step 2: Install Three.js dependencies**

```bash
npm install three @react-three/fiber @react-three/drei
npm install --save-dev @types/three
```

Expected: packages added to node_modules.

- [ ] **Step 3: Install test dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest
```

- [ ] **Step 4: Configure Jest — create `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.glsl$': '<rootDir>/src/__mocks__/glslMock.ts',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 5: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create GLSL mock `src/__mocks__/glslMock.ts`**

```typescript
const glslMock = ''
export default glslMock
```

- [ ] **Step 7: Create GLSL type declaration `src/glsl.d.ts`**

```typescript
declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert.glsl' {
  const value: string
  export default value
}

declare module '*.frag.glsl' {
  const value: string
  export default value
}
```

- [ ] **Step 8: Configure `next.config.ts` for GLSL imports**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source',
    })
    return config
  },
}

export default nextConfig
```

- [ ] **Step 9: Add test script to `package.json`**

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

- [ ] **Step 10: Verify setup**

```bash
npm run dev
```

Expected: Next.js starts on http://localhost:3000 with no errors.

- [ ] **Step 11: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with Three.js and Jest"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/planet.ts`

- [ ] **Step 1: Create `src/types/planet.ts`**

```typescript
export type PlanetType =
  | 'hot-jupiter'
  | 'gas-giant'
  | 'sub-neptune'
  | 'earth-like'
  | 'ocean-world'
  | 'rocky'
  | 'unknown'

export interface PlanetData {
  pl_name: string
  hostname: string
  pl_letter: string | null
  pl_rade: number | null       // radius in Earth radii
  pl_bmasse: number | null     // mass in Earth masses
  pl_dens: number | null       // density g/cm³
  pl_eqt: number | null        // equilibrium temperature K
  pl_insol: number | null      // insolation flux (Earth = 1)
  pl_orbper: number | null     // orbital period days
  pl_orbsmax: number | null    // semi-major axis au
  pl_orbeccen: number | null   // eccentricity
  disc_year: number | null
  discoverymethod: string | null
  disc_facility: string | null
  sy_dist: number | null       // distance in parsecs
  ra: number | null            // right ascension degrees
  dec: number | null           // declination degrees
  st_spectype: string | null   // e.g. "G2V"
  st_teff: number | null       // stellar effective temp K
  st_rad: number | null        // stellar radius solar radii
  // Derived fields (added by classify)
  planetType?: PlanetType
}

export interface StarData {
  hostname: string
  ra: number | null
  dec: number | null
  sy_dist: number | null
  st_spectype: string | null
  st_teff: number | null
  st_rad: number | null
  planets: PlanetData[]
}

export interface FilterParams {
  type?: PlanetType
  tempMin?: number
  tempMax?: number
  radiusMin?: number
  radiusMax?: number
  year?: number
  q?: string
  cursor?: string   // last pl_name for cursor pagination
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/planet.ts
git commit -m "feat: add PlanetData, StarData, FilterParams types"
```

---

### Task 3: Seed Utility

**Files:**
- Create: `src/lib/seed.ts`
- Create: `src/lib/__tests__/seed.test.ts`

- [ ] **Step 1: Write failing test `src/lib/__tests__/seed.test.ts`**

```typescript
import { planetSeed } from '@/lib/seed'

describe('planetSeed', () => {
  it('returns a positive integer for any string', () => {
    expect(planetSeed('Kepler-442 b')).toBeGreaterThan(0)
  })

  it('returns the same value for the same input', () => {
    expect(planetSeed('Kepler-442 b')).toBe(planetSeed('Kepler-442 b'))
  })

  it('returns different values for different inputs', () => {
    expect(planetSeed('Kepler-442 b')).not.toBe(planetSeed('Kepler-452 b'))
  })

  it('returns a float in 0..1 range via planetSeedNorm', () => {
    const { planetSeedNorm } = require('@/lib/seed')
    const v = planetSeedNorm('Kepler-442 b')
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- seed.test
```

Expected: FAIL — "Cannot find module '@/lib/seed'"

- [ ] **Step 3: Implement `src/lib/seed.ts`**

```typescript
/**
 * djb2 hash — deterministic integer from a string.
 * Same planet name always yields the same seed.
 */
export function planetSeed(name: string): number {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33) ^ name.charCodeAt(i)
    hash = hash >>> 0 // keep as unsigned 32-bit
  }
  return hash || 1 // never return 0
}

/** Normalised 0..1 version of the seed for use as a GLSL uniform */
export function planetSeedNorm(name: string): number {
  return (planetSeed(name) % 10000) / 10000
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- seed.test
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/seed.ts src/lib/__tests__/seed.test.ts
git commit -m "feat: add djb2 planet name seed utility"
```

---

### Task 4: Planet Classification

**Files:**
- Create: `src/lib/classify.ts`
- Create: `src/lib/__tests__/classify.test.ts`

- [ ] **Step 1: Write failing tests `src/lib/__tests__/classify.test.ts`**

```typescript
import { classifyPlanet } from '@/lib/classify'

describe('classifyPlanet', () => {
  it('classifies Hot Jupiter by radius alone', () => {
    expect(classifyPlanet({ pl_rade: 12, pl_eqt: 500 })).toBe('hot-jupiter')
  })

  it('classifies Hot Jupiter by high temp + large radius', () => {
    expect(classifyPlanet({ pl_rade: 5, pl_eqt: 1500 })).toBe('hot-jupiter')
  })

  it('classifies Gas Giant', () => {
    expect(classifyPlanet({ pl_rade: 8, pl_bmasse: 300, pl_eqt: 400 })).toBe('gas-giant')
  })

  it('classifies Sub-Neptune', () => {
    expect(classifyPlanet({ pl_rade: 3, pl_dens: 2 })).toBe('sub-neptune')
  })

  it('classifies Earth-like', () => {
    expect(classifyPlanet({ pl_rade: 1.5, pl_insol: 0.9 })).toBe('earth-like')
  })

  it('classifies Ocean World', () => {
    expect(classifyPlanet({ pl_rade: 2, pl_dens: 3, pl_eqt: 350 })).toBe('ocean-world')
  })

  it('classifies Rocky', () => {
    expect(classifyPlanet({ pl_rade: 1.1, pl_dens: 5.5 })).toBe('rocky')
  })

  it('returns unknown when data is insufficient', () => {
    expect(classifyPlanet({})).toBe('unknown')
    expect(classifyPlanet({ pl_rade: 2 })).toBe('unknown')
  })

  it('Hot Jupiter takes priority over Gas Giant', () => {
    expect(classifyPlanet({ pl_rade: 10, pl_bmasse: 300, pl_eqt: 1200 })).toBe('hot-jupiter')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- classify.test
```

Expected: FAIL — "Cannot find module '@/lib/classify'"

- [ ] **Step 3: Implement `src/lib/classify.ts`**

```typescript
import type { PlanetType } from '@/types/planet'

interface ClassifyInput {
  pl_rade?: number | null
  pl_bmasse?: number | null
  pl_dens?: number | null
  pl_eqt?: number | null
  pl_insol?: number | null
}

/** Priority-ordered classification from TAP data fields */
export function classifyPlanet(data: ClassifyInput): PlanetType {
  const r = data.pl_rade ?? null
  const m = data.pl_bmasse ?? null
  const d = data.pl_dens ?? null
  const t = data.pl_eqt ?? null
  const i = data.pl_insol ?? null

  // Hot Jupiter: very large OR hot + large
  if (r !== null && (r > 6 || (t !== null && t > 1000 && r > 4))) return 'hot-jupiter'

  // Gas Giant: large and massive
  if (r !== null && m !== null && r > 4 && m > 50) return 'gas-giant'

  // Sub-Neptune: medium radius, low density
  if (r !== null && d !== null && r >= 2 && r <= 4 && d < 3) return 'sub-neptune'

  // Earth-like: small-medium in habitable zone (insol check first)
  if (r !== null && i !== null && r >= 1 && r <= 2.5 && i >= 0.25 && i <= 1.5) return 'earth-like'

  // Ocean World: medium, low density, cool
  if (r !== null && d !== null && t !== null && r >= 1.5 && r <= 2.5 && d < 4 && t < 500) return 'ocean-world'

  // Rocky: small and dense
  if (r !== null && d !== null && r < 1.5 && d > 4) return 'rocky'

  return 'unknown'
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- classify.test
```

Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/classify.ts src/lib/__tests__/classify.test.ts
git commit -m "feat: add priority-ordered planet type classifier"
```

---

### Task 5: TAP API Fetch Utilities

**Files:**
- Create: `src/lib/tap.ts`
- Create: `src/lib/__tests__/tap.test.ts`

- [ ] **Step 1: Write failing tests `src/lib/__tests__/tap.test.ts`**

```typescript
import { fetchPlanets, fetchPlanet, fetchStar, fetchAllStarPositions } from '@/lib/tap'

const mockPlanet = {
  pl_name: 'Kepler-442 b', hostname: 'Kepler-442', pl_letter: 'b',
  pl_rade: 1.34, pl_bmasse: 2.3, pl_dens: 6.3, pl_eqt: 233, pl_insol: 0.7,
  pl_orbper: 112.3, pl_orbsmax: 0.409, pl_orbeccen: null, disc_year: 2015,
  discoverymethod: 'Transit', disc_facility: 'Kepler', sy_dist: 342,
  ra: 280.6, dec: 39.3, st_spectype: 'K', st_teff: 4402, st_rad: 0.598,
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [mockPlanet],
  } as Response)
})

afterEach(() => jest.resetAllMocks())

describe('fetchPlanets', () => {
  it('calls TAP API with correct URL', async () => {
    await fetchPlanets({})
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('exoplanetarchive.ipac.caltech.edu'),
      expect.any(Object)
    )
  })

  it('returns array of planets with planetType attached', async () => {
    const results = await fetchPlanets({})
    expect(results).toHaveLength(1)
    expect(results[0].pl_name).toBe('Kepler-442 b')
    expect(results[0].planetType).toBeDefined()
  })

  it('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(fetchPlanets({})).rejects.toThrow('TAP API error: 500')
  })
})

describe('fetchPlanet', () => {
  it('returns single planet by name', async () => {
    const planet = await fetchPlanet('Kepler-442 b')
    expect(planet?.pl_name).toBe('Kepler-442 b')
  })

  it('returns null when not found', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response)
    const planet = await fetchPlanet('Unknown Planet')
    expect(planet).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tap.test
```

Expected: FAIL — "Cannot find module '@/lib/tap'"

- [ ] **Step 3: Implement `src/lib/tap.ts`**

```typescript
import { classifyPlanet } from './classify'
import type { PlanetData, FilterParams, StarData } from '@/types/planet'

const BASE_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync'

const PLANET_FIELDS = [
  'pl_name', 'hostname', 'pl_letter', 'pl_rade', 'pl_bmasse', 'pl_dens',
  'pl_eqt', 'pl_insol', 'pl_orbper', 'pl_orbsmax', 'pl_orbeccen',
  'disc_year', 'discoverymethod', 'disc_facility', 'sy_dist',
  'ra', 'dec', 'st_spectype', 'st_teff', 'st_rad',
].join(',')

const STAR_POSITION_FIELDS = 'hostname,ra,dec,sy_dist,st_spectype,st_teff,st_rad'

const PAGE_SIZE = 24

async function tapQuery<T>(adql: string): Promise<T[]> {
  const url = `${BASE_URL}?query=${encodeURIComponent(adql)}&format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TAP API error: ${res.status}`)
  return res.json()
}

function attachType(planet: PlanetData): PlanetData {
  return { ...planet, planetType: classifyPlanet(planet) }
}

export async function fetchPlanets(filters: FilterParams): Promise<PlanetData[]> {
  const conditions: string[] = ['pl_controv_flag = 0']

  if (filters.q) {
    const escaped = filters.q.replace(/'/g, "''")
    conditions.push(`pl_name LIKE '%${escaped}%'`)
  }
  if (filters.tempMin != null) conditions.push(`pl_eqt >= ${filters.tempMin}`)
  if (filters.tempMax != null) conditions.push(`pl_eqt <= ${filters.tempMax}`)
  if (filters.radiusMin != null) conditions.push(`pl_rade >= ${filters.radiusMin}`)
  if (filters.radiusMax != null) conditions.push(`pl_rade <= ${filters.radiusMax}`)
  if (filters.year != null) conditions.push(`disc_year = ${filters.year}`)
  if (filters.cursor) {
    const escaped = filters.cursor.replace(/'/g, "''")
    conditions.push(`pl_name > '${escaped}'`)
  }

  const where = conditions.join(' AND ')
  const adql = `SELECT TOP ${PAGE_SIZE} ${PLANET_FIELDS} FROM pscomppars WHERE ${where} ORDER BY pl_name`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.map(attachType)
}

export async function fetchPlanet(name: string): Promise<PlanetData | null> {
  const escaped = name.replace(/'/g, "''")
  const adql = `SELECT ${PLANET_FIELDS} FROM pscomppars WHERE pl_name = '${escaped}'`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.length > 0 ? attachType(rows[0]) : null
}

export async function fetchStar(hostname: string): Promise<StarData | null> {
  const escaped = hostname.replace(/'/g, "''")
  const adql = `SELECT ${PLANET_FIELDS} FROM pscomppars WHERE hostname = '${escaped}' ORDER BY pl_letter`
  const rows = await tapQuery<PlanetData>(adql)
  if (rows.length === 0) return null
  const first = rows[0]
  return {
    hostname: first.hostname,
    ra: first.ra,
    dec: first.dec,
    sy_dist: first.sy_dist,
    st_spectype: first.st_spectype,
    st_teff: first.st_teff,
    st_rad: first.st_rad,
    planets: rows.map(attachType),
  }
}

export async function fetchAllStarPositions(): Promise<Pick<PlanetData, 'hostname' | 'ra' | 'dec' | 'sy_dist' | 'st_spectype'>[]> {
  const adql = `SELECT ${STAR_POSITION_FIELDS} FROM pscomppars WHERE sy_dist IS NOT NULL AND ra IS NOT NULL AND dec IS NOT NULL`
  return tapQuery(adql)
}

export async function fetchPlanetOfTheDay(): Promise<PlanetData | null> {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const offset = dayOfYear % 5500
  const adql = `SELECT TOP 1 ${PLANET_FIELDS} FROM pscomppars WHERE pl_controv_flag = 0 AND pl_rade IS NOT NULL ORDER BY pl_name OFFSET ${offset} ROWS`
  const rows = await tapQuery<PlanetData>(adql)
  return rows.length > 0 ? attachType(rows[0]) : null
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tap.test
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/tap.ts src/lib/__tests__/tap.test.ts
git commit -m "feat: add TAP API fetch utilities with cursor pagination"
```

---

## Phase 2: Three.js Shaders

### Task 6: Shared Planet Vertex Shader

**Files:**
- Create: `src/components/three/shaders/planet.vert.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/planet.vert.glsl`**

```glsl
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/planet.vert.glsl
git commit -m "feat: add shared planet vertex shader"
```

---

### Task 7: Rocky Planet Fragment Shader

**Files:**
- Create: `src/components/three/shaders/rocky.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/rocky.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

// Hash function seeded by uSeed
float hash(vec2 p) {
  float n = dot(p + uSeed * 0.1, vec2(127.1, 311.7));
  return fract(sin(n) * 43758.5453123);
}

// Value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Fractal Brownian Motion — 6 octaves
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 6; i++) {
    v += noise(p * freq) * amp;
    amp *= 0.5;
    freq *= 2.07;
  }
  return v;
}

void main() {
  vec2 p = vUv * 5.0 + uSeed * 0.01;

  float terrain = fbm(p);
  float detail  = fbm(p * 2.5 + 3.7);

  // Mars-like base palette
  vec3 lowland  = vec3(0.42, 0.20, 0.10);
  vec3 highland = vec3(0.62, 0.34, 0.16);
  vec3 rock     = vec3(0.55, 0.48, 0.40);

  vec3 color = mix(lowland, highland, smoothstep(0.35, 0.65, terrain));
  color = mix(color, rock, smoothstep(0.70, 0.85, terrain) * 0.5);

  // Craters — dark ring pattern using two noise layers
  float craterBase  = fbm(p * 1.8 + 9.3);
  float craterRim   = fbm(p * 1.8 + 9.3 + 0.04);
  float crater      = smoothstep(0.64, 0.67, craterBase) * (1.0 - smoothstep(0.67, 0.70, craterBase));
  float craterFloor = smoothstep(0.67, 0.70, craterBase) * 0.4;
  color = mix(color, vec3(0.12, 0.07, 0.04), crater * 0.85);
  color = mix(color, vec3(0.30, 0.16, 0.08), craterFloor);

  // Polar ice caps if equilibrium temp < 200 K
  float lat     = abs(vUv.y - 0.5) * 2.0;
  float iceEdge = fbm(vec2(vUv.x * 6.0, uSeed * 0.05)) * 0.08;
  if (uTemp < 200.0) {
    float iceMix = smoothstep(0.75 + iceEdge, 0.92 + iceEdge, lat);
    color = mix(color, vec3(0.88, 0.93, 1.0), iceMix);
  }

  // Lava cracks if equilibrium temp > 1000 K
  if (uTemp > 1000.0) {
    float lavaNoise    = fbm(p * 4.0 + 17.0);
    float lavaLine     = smoothstep(0.60, 0.63, lavaNoise) * (1.0 - smoothstep(0.63, 0.66, lavaNoise));
    float lavaStrength = clamp((uTemp - 1000.0) / 1000.0, 0.0, 1.0);
    color = mix(color, vec3(1.0, 0.28, 0.0), lavaLine * lavaStrength);
    // ambient glow from lava
    color += vec3(0.15, 0.04, 0.0) * lavaLine * lavaStrength * 0.5;
  }

  // Diffuse lighting
  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.25 + diff * 0.85;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/rocky.frag.glsl
git commit -m "feat: add rocky planet fragment shader with craters and lava/ice conditionals"
```

---

### Task 8: Gas Giant Fragment Shader

**Files:**
- Create: `src/components/three/shaders/gas-giant.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/gas-giant.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  float n = dot(p + uSeed * 0.1, vec2(127.1, 311.7));
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v=0.0, a=0.5, freq=1.0;
  for (int i=0;i<5;i++){v+=noise(p*freq)*a;a*=0.5;freq*=2.07;}
  return v;
}

// Band color palette — Jupiter warm ambers
vec3 bandColor(float band) {
  // 6 distinct band colors cycling
  float t = fract(band * 3.0);
  vec3 c0 = vec3(0.82, 0.65, 0.38);
  vec3 c1 = vec3(0.68, 0.42, 0.18);
  vec3 c2 = vec3(0.88, 0.76, 0.54);
  vec3 c3 = vec3(0.55, 0.30, 0.12);
  vec3 c4 = vec3(0.76, 0.56, 0.30);
  vec3 c5 = vec3(0.60, 0.38, 0.16);
  float idx = floor(band * 18.0);
  float r = fract(idx / 6.0);
  if (r < 0.167) return mix(c0, c1, t * 6.0);
  if (r < 0.334) return mix(c1, c2, (t - 0.167) * 6.0);
  if (r < 0.500) return mix(c2, c3, (t - 0.334) * 6.0);
  if (r < 0.667) return mix(c3, c4, (t - 0.500) * 6.0);
  if (r < 0.834) return mix(c4, c5, (t - 0.667) * 6.0);
  return mix(c5, c0, (t - 0.834) * 6.0);
}

void main() {
  // Turbulent band coordinate
  float turbU = fbm(vec2(vUv.x * 3.0 + uSeed * 0.01, vUv.y * 1.5) + uTime * 0.005);
  float bandY  = vUv.y + turbU * 0.18;

  vec3 color = bandColor(bandY);

  // Fine detail turbulence
  float detail = fbm(vUv * 8.0 + uSeed * 0.02 + uTime * 0.003) * 0.12;
  color += detail * vec3(0.15, 0.08, 0.02);

  // Great Red Spot — seeded position
  float spotX = 0.3 + fract(uSeed * 0.0001) * 0.4;
  float spotY = 0.35 + fract(uSeed * 0.00017) * 0.3;
  vec2 spotUv  = vUv - vec2(spotX, spotY);
  spotUv.x    *= 2.2; // elliptical
  float spotR  = length(spotUv);
  float spot   = smoothstep(0.12, 0.0, spotR);
  color = mix(color, vec3(0.65, 0.18, 0.08), spot * 0.75);

  // Cool blues at poles for cold gas giants
  if (uTemp < 150.0) {
    float lat = abs(vUv.y - 0.5) * 2.0;
    color = mix(color, vec3(0.55, 0.65, 0.80), smoothstep(0.7, 0.95, lat) * 0.5);
  }

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.3 + diff * 0.8;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/gas-giant.frag.glsl
git commit -m "feat: add gas giant fragment shader with bands and storm spot"
```

---

### Task 9: Hot Jupiter Fragment Shader

**Files:**
- Create: `src/components/three/shaders/hot-jupiter.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/hot-jupiter.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p + uSeed * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<5;i++){v+=noise(p*f)*a;a*=0.5;f*=2.1;}
  return v;
}

void main() {
  // Turbulent banding (hotter/more chaotic than gas giant)
  float turb = fbm(vec2(vUv.x * 4.0 + uSeed * 0.01, vUv.y * 2.0) + uTime * 0.01);
  float bandY = vUv.y + turb * 0.22;

  // Hot colour palette: deep red through orange
  float heatRamp = clamp((uTemp - 800.0) / 1200.0, 0.0, 1.0);
  vec3 cool = vec3(0.55, 0.15, 0.05);
  vec3 hot  = vec3(1.0, 0.38, 0.05);
  vec3 base = mix(cool, hot, heatRamp);

  // Band variation
  float band = fbm(vec2(uSeed * 0.01, bandY * 6.0));
  base += (band - 0.5) * vec3(0.15, 0.06, 0.02);

  vec3 color = base;

  // Star-facing dayside glow (high insolation — star is to the left in UV space)
  float dayside = 1.0 - vUv.x; // left = star-facing
  color += vec3(0.30, 0.10, 0.02) * dayside * dayside * 0.6;

  // Atmospheric ablation: bright rim on the star-facing edge
  float edgeGlow = smoothstep(0.85, 1.0, dayside) * smoothstep(0.4, 0.5, 1.0 - abs(vUv.y - 0.5) * 2.0);
  color = mix(color, vec3(1.0, 0.55, 0.1), edgeGlow * 0.7);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.35 + diff * 0.75;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/hot-jupiter.frag.glsl
git commit -m "feat: add hot jupiter fragment shader with dayside glow and ablation"
```

---

### Task 10: Ocean World Fragment Shader

**Files:**
- Create: `src/components/three/shaders/ocean.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/ocean.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p + uSeed * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<6;i++){v+=noise(p*f)*a;a*=0.5;f*=2.07;}
  return v;
}

void main() {
  vec2 p = vUv * 4.0 + uSeed * 0.01;

  // Deep ocean colour varying by depth noise
  float depth = fbm(p);
  vec3 shallowColor = vec3(0.05, 0.35, 0.70);
  vec3 deepColor    = vec3(0.01, 0.08, 0.30);
  vec3 color = mix(deepColor, shallowColor, depth);

  // Specular highlight — water surface
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
  float spec   = pow(max(0.0, dot(normalize(vNormal), halfVec)), 64.0);
  color += uLightColor * spec * 0.9;

  // Small surface chop
  float chop = fbm(p * 6.0 + uTime * 0.02) * 0.04;
  color += vec3(chop * 0.8, chop * 0.9, chop);

  // Polar ice caps
  float lat = abs(vUv.y - 0.5) * 2.0;
  float iceEdge = fbm(vec2(vUv.x * 5.0, uSeed * 0.03)) * 0.06;
  float iceFactor = smoothstep(0.78 + iceEdge, 0.95 + iceEdge, lat);
  // More ice if cooler
  float iceThreshold = clamp((400.0 - uTemp) / 200.0, 0.0, 1.0);
  color = mix(color, vec3(0.88, 0.93, 1.0), iceFactor * (0.5 + iceThreshold * 0.5));

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/ocean.frag.glsl
git commit -m "feat: add ocean world fragment shader with specular water and ice caps"
```

---

### Task 11: Earth-like Fragment Shader

**Files:**
- Create: `src/components/three/shaders/earth-like.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/earth-like.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p + uSeed * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<6;i++){v+=noise(p*f)*a;a*=0.5;f*=2.07;}
  return v;
}

void main() {
  vec2 p = vUv * 3.5 + uSeed * 0.01;
  float terrain = fbm(p);

  // Land vs ocean threshold
  float landThreshold = 0.50;
  bool isLand = terrain > landThreshold;

  vec3 color;
  if (isLand) {
    float elev = (terrain - landThreshold) / (1.0 - landThreshold);
    // Lowland green → highland brown → mountain grey
    vec3 jungle  = vec3(0.18, 0.42, 0.12);
    vec3 grass   = vec3(0.30, 0.52, 0.18);
    vec3 highland= vec3(0.48, 0.38, 0.22);
    vec3 mountain= vec3(0.62, 0.58, 0.52);
    vec3 snow    = vec3(0.90, 0.93, 0.96);

    if (elev < 0.25)      color = mix(jungle, grass, elev * 4.0);
    else if (elev < 0.55) color = mix(grass, highland, (elev - 0.25) * 3.3);
    else if (elev < 0.80) color = mix(highland, mountain, (elev - 0.55) * 4.0);
    else                  color = mix(mountain, snow, (elev - 0.80) * 5.0);
  } else {
    // Ocean — depth varies
    float depth = (landThreshold - terrain) / landThreshold;
    vec3 shallow = vec3(0.05, 0.40, 0.75);
    vec3 deep    = vec3(0.01, 0.08, 0.28);
    color = mix(shallow, deep, depth * 1.4);

    // Specular on ocean
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(normalize(uLightDir) + viewDir);
    float spec = pow(max(0.0, dot(normalize(vNormal), halfVec)), 48.0);
    color += uLightColor * spec * 0.6;
  }

  // Polar ice caps — size driven by temperature
  float lat      = abs(vUv.y - 0.5) * 2.0;
  float iceEdge  = fbm(vec2(vUv.x * 7.0, uSeed * 0.04)) * 0.07;
  float poleBase = mix(0.85, 0.65, clamp((300.0 - uTemp) / 150.0, 0.0, 1.0));
  float iceMix   = smoothstep(poleBase + iceEdge, poleBase + iceEdge + 0.12, lat);
  color = mix(color, vec3(0.90, 0.94, 1.0), iceMix);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.28 + diff * 0.85;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/earth-like.frag.glsl
git commit -m "feat: add earth-like fragment shader with continents, ocean, ice caps"
```

---

### Task 12: Sub-Neptune Fragment Shader

**Files:**
- Create: `src/components/three/shaders/sub-neptune.frag.glsl`

- [ ] **Step 1: Create `src/components/three/shaders/sub-neptune.frag.glsl`**

```glsl
uniform float uSeed;
uniform float uTemp;
uniform float uTime;
uniform vec3 uLightDir;
uniform vec3 uLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float hash(vec2 p) {
  return fract(sin(dot(p + uSeed * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,f=1.0;
  for(int i=0;i<5;i++){v+=noise(p*f)*a;a*=0.5;f*=2.07;}
  return v;
}

void main() {
  // Gentle horizontal banding with turbulence
  float turb = fbm(vec2(vUv.x * 2.5 + uSeed * 0.01, vUv.y) + uTime * 0.004) * 0.15;
  float bandY = vUv.y + turb;

  // Neptune-blue palette with seed-driven hue shift
  float hueShift = fract(uSeed * 0.00001) * 0.25; // slight variation
  vec3 deep   = vec3(0.02 + hueShift * 0.1, 0.08, 0.35);
  vec3 mid    = vec3(0.05 + hueShift * 0.1, 0.25, 0.70);
  vec3 bright = vec3(0.30 + hueShift * 0.1, 0.55, 0.90);

  float band = sin(bandY * 12.0 + uSeed * 0.1) * 0.5 + 0.5;
  float detail = fbm(vUv * 6.0 + uSeed * 0.02) * 0.3;

  vec3 color = mix(deep, mid, band);
  color = mix(color, bright, detail * 0.4);

  // Atmospheric haze brightens at limb
  float limb = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  color = mix(color, bright * 1.2, limb * limb * 0.35);

  float diff  = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
  float light = 0.32 + diff * 0.82;
  color *= light * uLightColor;

  gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/shaders/sub-neptune.frag.glsl
git commit -m "feat: add sub-neptune fragment shader with blue banding and limb haze"
```

---

## Phase 3: Three.js React Components

### Task 13: Planet Component

**Files:**
- Create: `src/components/three/Planet.tsx`

- [ ] **Step 1: Create `src/components/three/Planet.tsx`**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import type { PlanetType } from '@/types/planet'
import { planetSeedNorm } from '@/lib/seed'

import planetVert from './shaders/planet.vert.glsl'
import rockyFrag from './shaders/rocky.frag.glsl'
import gasGiantFrag from './shaders/gas-giant.frag.glsl'
import hotJupiterFrag from './shaders/hot-jupiter.frag.glsl'
import oceanFrag from './shaders/ocean.frag.glsl'
import earthLikeFrag from './shaders/earth-like.frag.glsl'
import subNeptuneFrag from './shaders/sub-neptune.frag.glsl'

// Shared uniform defaults
const defaultUniforms = {
  uSeed: 0.5,
  uTemp: 300.0,
  uTime: 0.0,
  uLightDir: new THREE.Vector3(1, 1, 1),
  uLightColor: new THREE.Color(1, 1, 1),
}

// One ShaderMaterial per planet type
const RockyMaterial     = shaderMaterial(defaultUniforms, planetVert, rockyFrag)
const GasGiantMaterial  = shaderMaterial(defaultUniforms, planetVert, gasGiantFrag)
const HotJupiterMaterial= shaderMaterial(defaultUniforms, planetVert, hotJupiterFrag)
const OceanMaterial     = shaderMaterial(defaultUniforms, planetVert, oceanFrag)
const EarthLikeMaterial = shaderMaterial(defaultUniforms, planetVert, earthLikeFrag)
const SubNeptuneMaterial= shaderMaterial(defaultUniforms, planetVert, subNeptuneFrag)

extend({
  RockyMaterial, GasGiantMaterial, HotJupiterMaterial,
  OceanMaterial, EarthLikeMaterial, SubNeptuneMaterial,
})

// Cloud sphere — used for ocean and earth-like
function CloudSphere({ radius, seed }: { radius: number; seed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => { meshRef.current.rotation.y += delta * 0.05 })
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.95, 0.97, 1.0),
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }), [])
  return (
    <mesh ref={meshRef} renderOrder={1}>
      <sphereGeometry args={[radius * 1.018, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

interface PlanetProps {
  name: string
  type: PlanetType
  radiusEarth?: number   // in Earth radii — used for visual size on detail page
  temp?: number
  lightDir?: THREE.Vector3
  lightColor?: THREE.Color
  /** If true, fills the canvas (detail page). If false, small card size. */
  large?: boolean
}

const VISUAL_RADIUS_DETAIL = 1.8   // three.js units on detail page
const VISUAL_RADIUS_CARD   = 0.9

export function Planet({
  name,
  type,
  temp = 300,
  lightDir = new THREE.Vector3(1.2, 1.0, 1.5),
  lightColor = new THREE.Color(1, 0.98, 0.92),
  large = false,
}: PlanetProps) {
  const meshRef  = useRef<THREE.Mesh>(null!)
  const matRef   = useRef<THREE.ShaderMaterial>(null!)

  const seed     = planetSeedNorm(name)
  const radius   = large ? VISUAL_RADIUS_DETAIL : VISUAL_RADIUS_CARD
  const hasClouds = type === 'earth-like' || type === 'ocean-world'

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.08
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const uniformValues = { uSeed: seed, uTemp: temp, uLightDir: lightDir, uLightColor: lightColor }

  const material = useMemo(() => {
    const map: Record<PlanetType, JSX.Element> = {
      'rocky':       <rockyMaterial ref={matRef}      {...uniformValues} />,
      'gas-giant':   <gasGiantMaterial ref={matRef}   {...uniformValues} />,
      'hot-jupiter': <hotJupiterMaterial ref={matRef} {...uniformValues} />,
      'ocean-world': <oceanMaterial ref={matRef}      {...uniformValues} />,
      'earth-like':  <earthLikeMaterial ref={matRef}  {...uniformValues} />,
      'sub-neptune': <subNeptuneMaterial ref={matRef} {...uniformValues} />,
      'unknown':     <rockyMaterial ref={matRef}      {...uniformValues} uTemp={200} />,
    }
    return map[type]
  }, [type, seed, temp])

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 128, 128]} />
        {material}
      </mesh>
      {hasClouds && <CloudSphere radius={radius} seed={seed} />}
    </group>
  )
}
```

- [ ] **Step 2: Write smoke test `src/components/three/__tests__/Planet.test.tsx`**

```tsx
import { render } from '@testing-library/react'
import { Planet } from '../Planet'

// Mock react-three-fiber and drei — no WebGL in Jest
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
  extend: jest.fn(),
  useThree: () => ({ camera: {}, gl: {} }),
}))
jest.mock('@react-three/drei', () => ({
  shaderMaterial: () => class MockMaterial {},
}))

describe('Planet', () => {
  it('renders without throwing', () => {
    expect(() =>
      render(<Planet name="Kepler-442 b" type="rocky" />)
    ).not.toThrow()
  })
})
```

- [ ] **Step 3: Run test**

```bash
npm test -- Planet.test
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/three/Planet.tsx src/components/three/__tests__/Planet.test.tsx
git commit -m "feat: add Planet component with per-type GLSL shader selection"
```

---

### Task 14: Star Component

**Files:**
- Create: `src/components/three/Star.tsx`

- [ ] **Step 1: Create `src/components/three/Star.tsx`**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Map spectral class first letter → RGB color */
function spectralColor(specType: string | null): THREE.Color {
  const t = (specType ?? 'G')[0].toUpperCase()
  const map: Record<string, [number, number, number]> = {
    O: [0.53, 0.67, 1.00],
    B: [0.70, 0.83, 1.00],
    A: [0.95, 0.97, 1.00],
    F: [1.00, 0.98, 0.87],
    G: [1.00, 0.93, 0.65],
    K: [1.00, 0.72, 0.35],
    M: [1.00, 0.42, 0.18],
  }
  const [r, g, b] = map[t] ?? map['G']
  return new THREE.Color(r, g, b)
}

interface StarProps {
  specType?: string | null
  large?: boolean
}

export function Star({ specType = 'G', large = false }: StarProps) {
  const coreRef  = useRef<THREE.Mesh>(null!)
  const glowRef  = useRef<THREE.Mesh>(null!)
  const color    = useMemo(() => spectralColor(specType), [specType])
  const radius   = large ? 1.8 : 0.9

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 + 1.0
    glowRef.current.scale.setScalar(pulse)
  })

  const coreMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    roughness: 1,
    metalness: 0,
  }), [color])

  const glowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.BackSide,
  }), [color])

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
      {/* Corona glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.35, 32, 32]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
      {/* Point light emanating from star */}
      <pointLight color={color} intensity={2.5} distance={20} />
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/Star.tsx
git commit -m "feat: add Star component with spectral-type color and corona glow"
```

---

### Task 15: PlanetScene Component

**Files:**
- Create: `src/components/three/PlanetScene.tsx`

- [ ] **Step 1: Create `src/components/three/PlanetScene.tsx`**

```tsx
'use client'

import { Suspense, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/** Derive directional light color from stellar spectral type */
function starLightColor(specType: string | null): THREE.Color {
  const t = (specType ?? 'G')[0].toUpperCase()
  const map: Record<string, string> = {
    O: '#88aaff', B: '#b0ccff', A: '#f0f4ff',
    F: '#fff8e0', G: '#fff0c0', K: '#ffd080', M: '#ff9040',
  }
  return new THREE.Color(map[t] ?? map['G'])
}

interface PlanetSceneProps {
  children: ReactNode
  hostSpecType?: string | null
  /** Fill the parent container (detail page) or constrain to card size */
  fill?: boolean
  className?: string
}

export function PlanetScene({
  children,
  hostSpecType = 'G',
  fill = false,
  className,
}: PlanetSceneProps) {
  const lightColor = starLightColor(hostSpecType)

  return (
    <div
      className={className}
      style={fill ? { width: '100%', height: '100%' } : { width: 96, height: 96 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Stars radius={80} depth={50} count={4000} factor={3} fade speed={0.6} />
        <ambientLight intensity={0.15} />
        <directionalLight
          color={lightColor}
          intensity={2.2}
          position={[3, 2, 4]}
        />
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <OrbitControls
          enableZoom={fill}
          enablePan={false}
          autoRotate={false}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/PlanetScene.tsx
git commit -m "feat: add PlanetScene canvas wrapper with starfield and orbit controls"
```

---

## Phase 4: UI Components

### Task 16: PlanetCard Component

**Files:**
- Create: `src/components/ui/PlanetCard.tsx`
- Create: `src/components/ui/__tests__/PlanetCard.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/ui/__tests__/PlanetCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PlanetCard } from '../PlanetCard'
import type { PlanetData } from '@/types/planet'

jest.mock('@/components/three/PlanetScene', () => ({
  PlanetScene: ({ children }: any) => <div data-testid="planet-scene">{children}</div>,
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

  it('renders radius and temp stats', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByText(/1\.34/)).toBeInTheDocument()
    expect(screen.getByText(/233/)).toBeInTheDocument()
  })

  it('links to planet detail page', () => {
    render(<PlanetCard planet={mockPlanet} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/planet/Kepler-442%20b')
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- PlanetCard.test
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Create `src/components/ui/PlanetCard.tsx`**

```tsx
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
  const type   = planet.planetType ?? 'unknown'
  const badge  = TYPE_BADGE[type]
  const href   = `/planet/${encodeURIComponent(planet.pl_name)}`

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
```

- [ ] **Step 4: Run test to verify pass**

```bash
npm test -- PlanetCard.test
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/PlanetCard.tsx src/components/ui/__tests__/PlanetCard.test.tsx
git commit -m "feat: add PlanetCard component with 3D render, type badge, stats"
```

---

### Task 17: FilterBar Component

**Files:**
- Create: `src/components/ui/FilterBar.tsx`
- Create: `src/components/ui/__tests__/FilterBar.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/ui/__tests__/FilterBar.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '../FilterBar'

const mockOnChange = jest.fn()

describe('FilterBar', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders search input', () => {
    render(<FilterBar filters={{}} onChange={mockOnChange} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders Type dropdown', () => {
    render(<FilterBar filters={{}} onChange={mockOnChange} />)
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument()
  })

  it('calls onChange when search input changes', async () => {
    render(<FilterBar filters={{}} onChange={mockOnChange} />)
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Kepler')
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ q: expect.stringContaining('K') }))
  })
})
```

- [ ] **Step 2: Run to verify fail**

```bash
npm test -- FilterBar.test
```

Expected: FAIL

- [ ] **Step 3: Create `src/components/ui/FilterBar.tsx`**

```tsx
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { FilterParams, PlanetType } from '@/types/planet'

const PLANET_TYPES: { value: PlanetType | ''; label: string }[] = [
  { value: '',            label: 'All Types' },
  { value: 'rocky',      label: 'Rocky' },
  { value: 'earth-like', label: 'Earth-like' },
  { value: 'ocean-world',label: 'Ocean World' },
  { value: 'sub-neptune',label: 'Sub-Neptune' },
  { value: 'gas-giant',  label: 'Gas Giant' },
  { value: 'hot-jupiter',label: 'Hot Jupiter' },
]

const TEMP_RANGES = [
  { value: '',         label: 'Any Temp' },
  { value: '0-200',    label: '< 200 K (Frozen)' },
  { value: '200-400',  label: '200–400 K (Habitable)' },
  { value: '400-1000', label: '400–1000 K (Hot)' },
  { value: '1000-99999', label: '> 1000 K (Extreme)' },
]

interface FilterBarProps {
  filters: FilterParams
  onChange: (filters: FilterParams) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback((key: keyof FilterParams, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('cursor') // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`)
    onChange({ ...filters, [key]: value || undefined, cursor: undefined })
  }, [filters, onChange, pathname, router, searchParams])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
      <input
        type="search"
        placeholder="Search planets…"
        value={filters.q ?? ''}
        onChange={(e) => update('q', e.target.value)}
        className="flex-1 min-w-[180px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />

      <select
        aria-label="Type"
        value={filters.type ?? ''}
        onChange={(e) => update('type', e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {PLANET_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        aria-label="Temperature"
        value={filters.tempMin != null ? `${filters.tempMin}-${filters.tempMax ?? 99999}` : ''}
        onChange={(e) => {
          const [min, max] = e.target.value.split('-').map(Number)
          const params = new URLSearchParams(searchParams.toString())
          if (e.target.value) {
            params.set('tempMin', String(min)); params.set('tempMax', String(max))
          } else {
            params.delete('tempMin'); params.delete('tempMax')
          }
          params.delete('cursor')
          router.push(`${pathname}?${params.toString()}`)
          onChange({ ...filters, tempMin: e.target.value ? min : undefined, tempMax: e.target.value ? max : undefined, cursor: undefined })
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
```

- [ ] **Step 4: Run test**

```bash
npm test -- FilterBar.test
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/FilterBar.tsx src/components/ui/__tests__/FilterBar.test.tsx
git commit -m "feat: add FilterBar with type, temperature, and search filters"
```

---

### Task 18: PlanetGrid Component

**Files:**
- Create: `src/components/ui/PlanetGrid.tsx`

- [ ] **Step 1: Create `src/components/ui/PlanetGrid.tsx`**

```tsx
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PlanetCard } from './PlanetCard'
import { FilterBar } from './FilterBar'
import type { PlanetData, FilterParams } from '@/types/planet'

interface PlanetGridProps {
  planets: PlanetData[]
  filters: FilterParams
  hasMore: boolean   // true if there are more results (last page had PAGE_SIZE items)
}

export function PlanetGrid({ planets, filters, hasMore }: PlanetGridProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters)

  const loadMore = () => {
    if (planets.length === 0) return
    const lastName = planets[planets.length - 1].pl_name
    const params = new URLSearchParams(searchParams.toString())
    params.set('cursor', lastName)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterBar filters={localFilters} onChange={setLocalFilters} />

      {planets.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No planets match your filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {planets.map((planet) => (
            <PlanetCard key={planet.pl_name} planet={planet} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="rounded-lg border border-slate-700 bg-slate-900 px-6 py-2 text-sm text-slate-300 transition hover:border-blue-600 hover:text-white"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/PlanetGrid.tsx
git commit -m "feat: add PlanetGrid with cursor pagination and filter bar"
```

---

### Task 19: HeroPlanet Component

**Files:**
- Create: `src/components/ui/HeroPlanet.tsx`

- [ ] **Step 1: Create `src/components/ui/HeroPlanet.tsx`**

```tsx
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

export function HeroPlanet({ planet }: { planet: PlanetData }) {
  const type  = planet.planetType ?? 'unknown'
  const href  = `/planet/${encodeURIComponent(planet.pl_name)}`

  return (
    <div className="relative flex min-h-[420px] items-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* 3D planet — left side, large */}
      <div className="h-[420px] w-1/2 shrink-0">
        <PlanetScene hostSpecType={planet.st_spectype} fill className="h-full w-full">
          <Planet name={planet.pl_name} type={type} temp={planet.pl_eqt ?? 300} large />
        </PlanetScene>
      </div>

      {/* Info — right side */}
      <div className="flex flex-col gap-4 px-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          ✦ Planet of the Day
        </p>
        <h1 className="text-4xl font-bold text-white">{planet.pl_name}</h1>
        <p className="text-slate-400">
          {TYPE_LABELS[type]} · {planet.hostname} · {planet.sy_dist != null ? `${Math.round(planet.sy_dist * 3.26)} ly away` : ''}
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
              <p className="text-xl font-semibold text-slate-200">{planet.pl_orbper.toFixed(1)}d</p>
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
            href="/?random=1"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            ✦ Random
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/HeroPlanet.tsx
git commit -m "feat: add HeroPlanet landing page hero section"
```

---

### Task 20: StatPanel and HostStarCard

**Files:**
- Create: `src/components/ui/StatPanel.tsx`
- Create: `src/components/ui/HostStarCard.tsx`

- [ ] **Step 1: Create `src/components/ui/HostStarCard.tsx`**

```tsx
import Link from 'next/link'
import { Star } from '@/components/three/Star'
import { PlanetScene } from '@/components/three/PlanetScene'

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
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <PlanetScene hostSpecType={specType}>
          <Star specType={specType} />
        </PlanetScene>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-blue-400">{hostname} ↗</p>
        <p className="text-xs text-slate-500">
          {specType ?? '?'} · {teff != null ? `${teff} K` : ''}
          {dist != null ? ` · ${Math.round(dist * 3.26)} ly` : ''}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/StatPanel.tsx`**

```tsx
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
    <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← Back</Link>
          <h1 className="mt-1 text-lg font-bold text-white">{planet.pl_name}</h1>
        </div>
        <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 capitalize">
          {planet.planetType?.replace('-', ' ') ?? 'Unknown'}
        </span>
      </div>

      <Section title="Physical">
        <Row label="Radius"      value={planet.pl_rade != null ? `${planet.pl_rade} R⊕` : null} />
        <Row label="Mass"        value={planet.pl_bmasse != null ? `${planet.pl_bmasse} M⊕` : null} />
        <Row label="Density"     value={planet.pl_dens != null ? `${planet.pl_dens} g/cm³` : null} />
        <Row label="Eq. Temp"    value={planet.pl_eqt != null ? `${planet.pl_eqt} K` : null} />
      </Section>

      <Section title="Orbital">
        <Row label="Period"      value={planet.pl_orbper != null ? `${planet.pl_orbper.toFixed(2)} days` : null} />
        <Row label="Semi-axis"   value={planet.pl_orbsmax != null ? `${planet.pl_orbsmax} au` : null} />
        <Row label="Eccentricity"value={planet.pl_orbeccen != null ? planet.pl_orbeccen.toFixed(3) : null} />
        <Row label="Insolation"  value={planet.pl_insol != null ? `${planet.pl_insol.toFixed(2)} F⊕` : null} />
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
        <Row label="Year"        value={planet.disc_year} />
        <Row label="Method"      value={planet.discoverymethod} />
        <Row label="Facility"    value={planet.disc_facility} />
      </Section>

      <Section title="Location">
        <SkyWidget ra={planet.ra} dec={planet.dec} hostname={planet.hostname} />
        <Link
          href={`/map?highlight=${encodeURIComponent(planet.hostname)}`}
          className="mt-1 text-xs text-blue-400 hover:underline"
        >
          View on star map →
        </Link>
      </Section>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/StatPanel.tsx src/components/ui/HostStarCard.tsx
git commit -m "feat: add StatPanel with grouped stats and HostStarCard"
```

---

### Task 21: SkyWidget Component

**Files:**
- Create: `src/components/ui/SkyWidget.tsx`

- [ ] **Step 1: Create `src/components/ui/SkyWidget.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { planetSeed } from '@/lib/seed'

interface SkyWidgetProps {
  ra?: number | null    // degrees
  dec?: number | null   // degrees
  hostname: string
}

export function SkyWidget({ ra, dec, hostname }: SkyWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 160, H = 160, cx = 80, cy = 80, r = 72

    ctx.clearRect(0, 0, W, H)

    // Dark sky background
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    bg.addColorStop(0, '#0a0a20')
    bg.addColorStop(1, '#030310')
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = bg; ctx.fill()

    // Background stars seeded by hostname
    const seed = planetSeed(hostname)
    for (let i = 0; i < 100; i++) {
      const s = planetSeed(`${hostname}-star-${i}`)
      const angle = ((s * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff * Math.PI * 2
      const dist  = Math.sqrt(((s * 22695477 + 1) & 0xffffffff) / 0xffffffff) * r * 0.92
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist
      const sz = ((s & 7) / 7) * 1.2 + 0.3
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180, 200, 255, ${0.2 + sz * 0.2})`; ctx.fill()
    }

    // Grid
    ctx.strokeStyle = 'rgba(30, 30, 80, 0.7)'; ctx.lineWidth = 0.6
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (i / 3) * r, 0, Math.PI * 2); ctx.stroke()
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke()
    }

    if (ra != null && dec != null) {
      // Project RA/Dec to 2D using azimuthal equidistant projection
      const raRad  = (ra / 360) * Math.PI * 2
      const decRad = (dec / 90) * (Math.PI / 2)
      const dist2  = ((Math.PI / 2 - Math.abs(decRad)) / (Math.PI / 2)) * r * 0.92
      const kx = cx + Math.cos(raRad) * dist2 * (dec >= 0 ? 1 : -1)
      const ky = cy - Math.sin(raRad) * dist2 * (dec >= 0 ? 1 : -1)

      // Glow
      const glow = ctx.createRadialGradient(kx, ky, 0, kx, ky, 12)
      glow.addColorStop(0, 'rgba(255, 220, 80, 0.5)')
      glow.addColorStop(1, 'rgba(255, 220, 80, 0)')
      ctx.beginPath(); ctx.arc(kx, ky, 12, 0, Math.PI * 2)
      ctx.fillStyle = glow; ctx.fill()

      // Star dot
      ctx.beginPath(); ctx.arc(kx, ky, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffd060'; ctx.fill()

      // Crosshair
      ctx.strokeStyle = 'rgba(255, 210, 60, 0.5)'; ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(kx - 8, ky); ctx.lineTo(kx + 8, ky); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(kx, ky - 8); ctx.lineTo(kx, ky + 8); ctx.stroke()
    }

    // Clip to circle + border
    ctx.save(); ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.restore()
    ctx.strokeStyle = '#1e1e4a'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }, [ra, dec, hostname])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} width={160} height={160} className="rounded-full" />
      {ra != null && dec != null && (
        <p className="text-xs text-slate-500">
          RA {ra.toFixed(2)}° · Dec {dec.toFixed(2)}°
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/SkyWidget.tsx
git commit -m "feat: add SkyWidget 2D sky chart with RA/Dec projection"
```

---

## Phase 5: Pages

### Task 22: Root Layout and Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Exoplanets',
  description: 'Explore confirmed exoplanets from the NASA Archive',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#07071a] text-slate-200`}>
        <nav className="flex items-center gap-4 border-b border-slate-800 px-6 py-4">
          <a href="/" className="text-sm font-bold tracking-widest text-blue-400">EXOPLANETS</a>
          <a href="/map" className="ml-auto text-sm text-slate-500 hover:text-slate-300">Star Map</a>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `src/app/page.tsx`**

```tsx
import { fetchPlanetOfTheDay, fetchPlanets } from '@/lib/tap'
import { HeroPlanet } from '@/components/ui/HeroPlanet'
import { PlanetGrid } from '@/components/ui/PlanetGrid'
import type { FilterParams } from '@/types/planet'

interface PageProps {
  searchParams: { [key: string]: string | undefined }
}

export default async function HomePage({ searchParams }: PageProps) {
  const filters: FilterParams = {
    q:          searchParams.q,
    type:       searchParams.type as FilterParams['type'],
    tempMin:    searchParams.tempMin ? Number(searchParams.tempMin) : undefined,
    tempMax:    searchParams.tempMax ? Number(searchParams.tempMax) : undefined,
    radiusMin:  searchParams.radiusMin ? Number(searchParams.radiusMin) : undefined,
    radiusMax:  searchParams.radiusMax ? Number(searchParams.radiusMax) : undefined,
    year:       searchParams.year ? Number(searchParams.year) : undefined,
    cursor:     searchParams.cursor,
  }

  const [hero, planets] = await Promise.all([
    fetchPlanetOfTheDay(),
    fetchPlanets(filters),
  ])

  const hasMore = planets.length === 24

  return (
    <div className="flex flex-col gap-10">
      {hero && <HeroPlanet planet={hero} />}
      <PlanetGrid planets={planets} filters={filters} hasMore={hasMore} />
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and verify landing page loads**

```bash
npm run dev
```

Open http://localhost:3000 — expect hero planet and grid to render.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add landing page with hero planet and browsable grid"
```

---

### Task 23: Planet Detail Page

**Files:**
- Create: `src/app/planet/[name]/page.tsx`

- [ ] **Step 1: Create `src/app/planet/[name]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { fetchPlanet } from '@/lib/tap'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Planet } from '@/components/three/Planet'
import { StatPanel } from '@/components/ui/StatPanel'
import type { Metadata } from 'next'

interface Props { params: { name: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.name)
  return { title: `${name} — Exoplanets` }
}

export default async function PlanetPage({ params }: Props) {
  const name   = decodeURIComponent(params.name)
  const planet = await fetchPlanet(name)
  if (!planet) notFound()

  const type = planet.planetType ?? 'unknown'

  return (
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

      {/* Right: Stats panel — 40% width */}
      <div className="flex-[2] overflow-y-auto border-l border-slate-800 bg-slate-950">
        <StatPanel planet={planet} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify by navigating to a planet**

```bash
npm run dev
```

Open http://localhost:3000/planet/Kepler-442%20b — expect full-screen 3D planet with stats panel.

- [ ] **Step 3: Commit**

```bash
git add src/app/planet/
git commit -m "feat: add planet detail page with large 3D viewer and stats panel"
```

---

### Task 24: Star Detail Page

**Files:**
- Create: `src/app/star/[name]/page.tsx`

- [ ] **Step 1: Create `src/app/star/[name]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { fetchStar } from '@/lib/tap'
import { PlanetScene } from '@/components/three/PlanetScene'
import { Star } from '@/components/three/Star'
import { PlanetCard } from '@/components/ui/PlanetCard'
import { SkyWidget } from '@/components/ui/SkyWidget'
import type { Metadata } from 'next'

interface Props { params: { name: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.name)
  return { title: `${name} — Exoplanets` }
}

export default async function StarPage({ params }: Props) {
  const name = decodeURIComponent(params.name)
  const star = await fetchStar(name)
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/star/
git commit -m "feat: add star detail page with 3D star, stellar stats, and planet list"
```

---

### Task 25: StarMap Component

**Files:**
- Create: `src/components/three/StarMap.tsx`

- [ ] **Step 1: Create `src/components/three/StarMap.tsx`**

```tsx
'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls, Html } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'

// Convert RA/Dec/distance to 3D Cartesian (parsecs, log-scaled)
function toCartesian(ra: number, dec: number, distPc: number, logScale: number): THREE.Vector3 {
  const raRad  = (ra  * Math.PI) / 180
  const decRad = (dec * Math.PI) / 180
  // Log scale: compress distance so near/far are both visible
  const d = Math.log10(Math.max(1, distPc)) * logScale
  return new THREE.Vector3(
    d * Math.cos(decRad) * Math.cos(raRad),
    d * Math.sin(decRad),
    d * Math.cos(decRad) * Math.sin(raRad),
  )
}

// Star spectral type → hex color string
function specColor(spec: string | null | undefined): string {
  const t = (spec ?? 'G')[0].toUpperCase()
  const map: Record<string, string> = {
    O: '#88aaff', B: '#b0ccff', A: '#f0f4ff',
    F: '#fff8e0', G: '#ffd060', K: '#ff9040', M: '#ff4020',
  }
  return map[t] ?? map['G']
}

interface StarDot {
  hostname: string
  ra: number
  dec: number
  sy_dist: number
  st_spectype?: string | null
}

interface StarMapSceneProps {
  stars: StarDot[]
  highlight?: string
  logScale: number
}

function StarMapScene({ stars, highlight, logScale }: StarMapSceneProps) {
  const router  = useRouter()
  const groupRef = useRef<THREE.Group>(null!)

  const positions = useMemo(() => {
    return stars.map((s) => toCartesian(s.ra, s.dec, s.sy_dist, logScale))
  }, [stars, logScale])

  const highlightedIdx = highlight
    ? stars.findIndex((s) => s.hostname.toLowerCase() === highlight.toLowerCase())
    : -1

  return (
    <group ref={groupRef}>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244aa" emissiveIntensity={1} />
      </mesh>
      <Html center position={[0, 0.22, 0]}>
        <span style={{ color: '#4af', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>Earth</span>
      </Html>

      {/* Star dots */}
      {stars.map((star, i) => {
        const pos = positions[i]
        const isHighlight = i === highlightedIdx
        const color = isHighlight ? '#ffd060' : specColor(star.st_spectype)
        const size  = isHighlight ? 0.18 : 0.06

        return (
          <mesh
            key={star.hostname}
            position={pos}
            onClick={() => router.push(`/star/${encodeURIComponent(star.hostname)}`)}
          >
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isHighlight ? 2 : 0.8}
            />
            {isHighlight && (
              <Html center position={[0, size + 0.1, 0]}>
                <span style={{ color: '#ffd060', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  {star.hostname}
                </span>
              </Html>
            )}
          </mesh>
        )
      })}

      {/* Line from Earth to highlighted star */}
      {highlightedIdx >= 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, ...positions[highlightedIdx].toArray()]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffd06044" transparent opacity={0.3} />
        </line>
      )}
    </group>
  )
}

interface StarMapProps {
  stars: StarDot[]
  highlight?: string
}

export function StarMap({ stars, highlight }: StarMapProps) {
  const [logScale, setLogScale] = useState(8)

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <Stars radius={200} depth={100} count={6000} factor={4} fade />
        <StarMapScene stars={stars} highlight={highlight} logScale={logScale} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={80} />
      </Canvas>

      {/* Log scale slider overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 backdrop-blur">
        <span className="text-xs text-slate-400">Nearby</span>
        <input
          type="range" min={3} max={14} step={0.5}
          value={logScale}
          onChange={(e) => setLogScale(Number(e.target.value))}
          className="w-32 accent-blue-500"
        />
        <span className="text-xs text-slate-400">Distant</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/StarMap.tsx
git commit -m "feat: add StarMap 3D scatter plot with log-scale distance slider"
```

---

### Task 26: Star Map Page

**Files:**
- Create: `src/app/map/page.tsx`

- [ ] **Step 1: Create `src/app/map/page.tsx`**

```tsx
import { fetchAllStarPositions } from '@/lib/tap'
import { StarMap } from '@/components/three/StarMap'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Star Map — Exoplanets' }

interface Props { searchParams: { highlight?: string } }

export default async function MapPage({ searchParams }: Props) {
  const stars = await fetchAllStarPositions()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Star Map</h1>
        <p className="text-sm text-slate-400">
          {stars.length.toLocaleString()} known exoplanet host stars relative to Earth.
          Drag to rotate · Scroll to zoom · Click any star to explore.
        </p>
      </div>
      <div className="h-[calc(100vh-180px)] overflow-hidden rounded-2xl border border-slate-800 bg-[#03030f]">
        <StarMap stars={stars} highlight={searchParams.highlight} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify star map page**

```bash
npm run dev
```

Open http://localhost:3000/map — expect 3D star neighborhood with drag/zoom and distance slider.

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Final commit**

```bash
git add src/app/map/ src/components/three/StarMap.tsx
git commit -m "feat: add star map page with 3D star neighborhood"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `/` landing page with hero planet + grid — Task 22
- ✅ `/planet/[name]` detail page with 3D viewer + stats — Task 23
- ✅ `/star/[name]` detail page with star render + planet list — Task 24
- ✅ `/map` 3D star neighborhood — Tasks 25–26
- ✅ TAP API with `pscomppars` table — Task 5
- ✅ Planet classification (6 types + unknown) — Task 4
- ✅ Seed system (djb2, unique but consistent per planet) — Task 3
- ✅ All 6 GLSL shaders — Tasks 7–12
- ✅ Planet component with shader selector + cloud layer — Task 13
- ✅ Star component with spectral color + corona glow — Task 14
- ✅ PlanetScene (starfield, orbit controls, star lighting) — Task 15
- ✅ PlanetCard with 3D render + type badge — Task 16
- ✅ FilterBar (type, temp, search) — Task 17
- ✅ PlanetGrid with cursor pagination — Task 18
- ✅ HeroPlanet landing hero — Task 19
- ✅ StatPanel (Physical/Orbital/Star/Discovery/Location) — Task 20
- ✅ HostStarCard clickable → `/star/[name]` — Task 20
- ✅ SkyWidget (2D RA/Dec sky chart) — Task 21
- ✅ Log-scale distance slider on `/map` — Task 25
- ✅ `?highlight` param on `/map` — Task 25–26
- ✅ Cursor pagination — Task 5, 18
- ✅ Filter URL params (bookmarkable) — Task 17

**No TBDs, placeholders, or incomplete steps found.**
