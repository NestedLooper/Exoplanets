'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
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
const SPEC_COLOR_MAP: Record<string, string> = {
  O: '#88aaff', B: '#b0ccff', A: '#f0f4ff',
  F: '#fff8e0', G: '#ffd060', K: '#ff9040', M: '#ff4020',
}
function specColor(spec: string | null | undefined): string {
  return SPEC_COLOR_MAP[(spec ?? 'G')[0].toUpperCase()] ?? SPEC_COLOR_MAP['G']
}

// Module-level reusable objects (avoid per-render allocation)
const _matrix = new THREE.Matrix4()
const _color = new THREE.Color()
const SPHERE_GEO = new THREE.SphereGeometry(0.06, 8, 8)
const DOT_MAT = new THREE.MeshStandardMaterial({ color: '#ffffff' })

// Hoisted style constants
const EARTH_LABEL_STYLE: React.CSSProperties = {
  color: '#4af', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace',
}
const HIGHLIGHT_LABEL_STYLE: React.CSSProperties = {
  color: '#ffd060', fontSize: 9, whiteSpace: 'nowrap', fontFamily: 'monospace',
}

// Hoisted camera config
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
  const router = useRouter()
  const instanceRef = useRef<THREE.InstancedMesh>(null!)

  const positions = useMemo(() => {
    return stars.map((s) => toCartesian(s.ra, s.dec, s.sy_dist, logScale))
  }, [stars, logScale])

  const highlightedIdx = useMemo(() => {
    if (!highlight) return -1
    return stars.findIndex((s) => s.hostname.toLowerCase() === highlight.toLowerCase())
  }, [stars, highlight])

  // Update instance matrices and colors whenever positions change
  useEffect(() => {
    const mesh = instanceRef.current
    if (!mesh) return
    stars.forEach((star, i) => {
      if (i === highlightedIdx) {
        // Hide this instance (scale to 0) — rendered as a separate highlighted mesh
        _matrix.makeScale(0, 0, 0)
      } else {
        const pos = positions[i]
        _matrix.makeTranslation(pos.x, pos.y, pos.z)
      }
      mesh.setMatrixAt(i, _matrix)
      _color.set(specColor(star.st_spectype))
      mesh.setColorAt(i, _color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [stars, positions, highlightedIdx])

  // Declarative line geometry — r3f manages lifecycle, no disposal leak
  const linePoints = useMemo(() => {
    if (highlightedIdx < 0) return null
    return new Float32Array([0, 0, 0, ...positions[highlightedIdx].toArray()])
  }, [highlightedIdx, positions])

  const highlightPos = highlightedIdx >= 0 ? positions[highlightedIdx] : null

  return (
    <group>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244aa" emissiveIntensity={1} />
      </mesh>
      <Html center position={[0, 0.22, 0]}>
        <span style={EARTH_LABEL_STYLE}>Earth</span>
      </Html>

      {/* All non-highlighted stars as instanced mesh */}
      <instancedMesh
        ref={instanceRef}
        args={[SPHERE_GEO, DOT_MAT, stars.length]}
        onClick={(e) => {
          if (e.instanceId != null) {
            router.push(`/star/${encodeURIComponent(stars[e.instanceId].hostname)}`)
          }
        }}
      />

      {/* Highlighted star as separate mesh */}
      {highlightPos && (
        <mesh
          position={highlightPos}
          onClick={() => router.push(`/star/${encodeURIComponent(stars[highlightedIdx].hostname)}`)}
        >
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#ffd060" emissive="#ffd060" emissiveIntensity={2} />
          <Html center position={[0, 0.28, 0]}>
            <span style={HIGHLIGHT_LABEL_STYLE}>{stars[highlightedIdx].hostname}</span>
          </Html>
        </mesh>
      )}

      {/* Dashed line from Earth to highlighted star — declarative, no disposal leak */}
      {highlightedIdx >= 0 && linePoints && (
        <lineSegments onUpdate={(self) => self.computeLineDistances()}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePoints, 3]}
              array={linePoints}
              itemSize={3}
              count={2}
            />
          </bufferGeometry>
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
  const [logScale, setLogScale] = useState(8) // 8 gives a good initial view of 1-10,000 ly range

  return (
    <div className="relative h-full w-full">
      <Canvas camera={CAMERA_CONFIG}>
        <ambientLight intensity={0.3} />
        <Stars radius={200} depth={100} count={6000} factor={4} fade />
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
