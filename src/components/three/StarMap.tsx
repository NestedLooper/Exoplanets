'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'

// Convert RA/Dec/distance to 3D Cartesian (parsecs, log-scaled)
function toCartesian(ra: number, dec: number, distPc: number, logScale: number): THREE.Vector3 {
  const raRad  = (ra  * Math.PI) / 180
  const decRad = (dec * Math.PI) / 180
  const d = Math.log10(Math.max(1, distPc)) * logScale
  return new THREE.Vector3(
    d * Math.cos(decRad) * Math.cos(raRad),
    d * Math.sin(decRad),
    d * Math.cos(decRad) * Math.sin(raRad),
  )
}

// Spectral type → RGB (linear, not sRGB hex)
const SPEC_RGB: Record<string, [number, number, number]> = {
  O: [0.53, 0.67, 1.00],
  B: [0.70, 0.83, 1.00],
  A: [0.95, 0.97, 1.00],
  F: [1.00, 0.98, 0.87],
  G: [1.00, 0.87, 0.38],
  K: [1.00, 0.56, 0.25],
  M: [1.00, 0.26, 0.13],
}
// Apparent visual size in pixels: O=biggest/brightest, M=smallest/dimmest
const SPEC_SIZE: Record<string, number> = {
  O: 8.0, B: 6.5, A: 5.5, F: 4.5, G: 4.0, K: 3.5, M: 3.0,
}

function specRGB(spec: string | null | undefined): [number, number, number] {
  return SPEC_RGB[(spec ?? 'G')[0].toUpperCase()] ?? SPEC_RGB['G']
}
function specSize(spec: string | null | undefined): number {
  return SPEC_SIZE[(spec ?? 'G')[0].toUpperCase()] ?? SPEC_SIZE['G']
}

// Custom point shader: round soft-glow dots with per-point size + colour
const POINT_VERT = /* glsl */`
attribute float aSize;
attribute vec3  aColor;
varying   vec3  vColor;

void main() {
  vColor       = aColor;
  gl_PointSize = aSize;           // fixed screen-space pixels — no depth scaling
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const POINT_FRAG = /* glsl */`
varying vec3 vColor;

void main() {
  vec2  coord = gl_PointCoord - 0.5;
  float dist  = length(coord);
  if (dist > 0.5) discard;
  // Hard bright core + thin outer glow only
  float core = smoothstep(0.22, 0.0,  dist);         // crisp center disc
  float halo = smoothstep(0.50, 0.22, dist) * 0.35;  // subtle fringe, not blurry
  gl_FragColor = vec4(vColor, clamp(core + halo, 0.0, 1.0));
}
`

const EARTH_LABEL_STYLE: React.CSSProperties = {
  color: '#4af', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace',
}
const HIGHLIGHT_LABEL_STYLE: React.CSSProperties = {
  color: '#ffd060', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace',
}

const CAMERA_CONFIG = { position: [0, 0, 30] as [number, number, number], fov: 60 }

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
  const router   = useRouter()
  const lineRef  = useRef<THREE.LineSegments>(null!)
  const { raycaster } = useThree()

  // World-space threshold for point picking — 1 unit works well across zoom levels
  useEffect(() => {
    raycaster.params.Points = { threshold: 1.0 }
  }, [raycaster])

  const positions = useMemo(
    () => stars.map((s) => toCartesian(s.ra, s.dec, s.sy_dist, logScale)),
    [stars, logScale],
  )

  const highlightedIdx = useMemo(() => {
    if (!highlight) return -1
    return stars.findIndex((s) => s.hostname.toLowerCase() === highlight.toLowerCase())
  }, [stars, highlight])

  // Build Points geometry — position + per-point colour + per-point size
  const { pointsGeo, pointsMat } = useMemo(() => {
    const posArr  = new Float32Array(stars.length * 3)
    const colArr  = new Float32Array(stars.length * 3)
    const sizeArr = new Float32Array(stars.length)
    stars.forEach((star, i) => {
      const pos = positions[i]
      posArr[i * 3]     = pos.x
      posArr[i * 3 + 1] = pos.y
      posArr[i * 3 + 2] = pos.z
      const [r, g, b] = specRGB(star.st_spectype)
      colArr[i * 3]     = r
      colArr[i * 3 + 1] = g
      colArr[i * 3 + 2] = b
      sizeArr[i] = specSize(star.st_spectype)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(posArr,  3))
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colArr,  3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizeArr, 1))
    const mat = new THREE.ShaderMaterial({
      vertexShader:   POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent:    true,
      depthWrite:     false,
    })
    return { pointsGeo: geo, pointsMat: mat }
  }, [stars, positions])

  // Dashed line geometry to highlighted star
  const lineGeo = useMemo(() => {
    if (highlightedIdx < 0) return null
    const pts = new Float32Array([0, 0, 0, ...positions[highlightedIdx].toArray()])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    return geo
  }, [highlightedIdx, positions])

  useEffect(() => {
    if (lineRef.current && lineGeo) lineRef.current.computeLineDistances()
  }, [lineGeo])

  const handlePointClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const idx = e.intersections[0]?.index
    if (idx != null) {
      router.push(`/star/${encodeURIComponent(stars[idx].hostname)}`)
    }
  }, [router, stars])

  const highlightPos = highlightedIdx >= 0 ? positions[highlightedIdx] : null

  return (
    <group>
      {/* Earth origin */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244aa" emissiveIntensity={1} />
      </mesh>
      <Html center position={[0, 0.22, 0]}>
        <span style={EARTH_LABEL_STYLE}>Earth</span>
      </Html>

      {/* All data stars as clickable Points */}
      <points geometry={pointsGeo} material={pointsMat} onClick={handlePointClick} />

      {/* Highlighted star — larger glowing sphere on top */}
      {highlightPos && (
        <mesh
          position={highlightPos}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/star/${encodeURIComponent(stars[highlightedIdx].hostname)}`)
          }}
        >
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#ffd060" emissive="#ffd060" emissiveIntensity={2.5} />
          <Html center position={[0, 0.35, 0]}>
            <span style={HIGHLIGHT_LABEL_STYLE}>{stars[highlightedIdx].hostname}</span>
          </Html>
        </mesh>
      )}

      {/* Dashed line from Earth to highlighted star */}
      {lineGeo && (
        <lineSegments ref={lineRef} geometry={lineGeo}>
          <lineDashedMaterial color="#ffd060" transparent opacity={0.35} dashSize={0.4} gapSize={0.3} />
        </lineSegments>
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
      <Canvas camera={CAMERA_CONFIG} gl={{ antialias: true }}>
        <color attach="background" args={['#03030f']} />
        <ambientLight intensity={0.4} />
        <StarMapScene stars={stars} highlight={highlight} logScale={logScale} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={80} />
      </Canvas>

      {/* Log scale slider overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 backdrop-blur">
        <span className="text-xs text-slate-400">Nearby</span>
        <input
          aria-label="Distance log scale"
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
