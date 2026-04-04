'use client'

import { useRef, useMemo, useState } from 'react'
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

  const positions = useMemo(() => {
    return stars.map((s) => toCartesian(s.ra, s.dec, s.sy_dist, logScale))
  }, [stars, logScale])

  const highlightedIdx = highlight
    ? stars.findIndex((s) => s.hostname.toLowerCase() === highlight.toLowerCase())
    : -1

  const linePrimitive = useMemo(() => {
    if (highlightedIdx < 0) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array([0, 0, 0, ...positions[highlightedIdx].toArray()]),
        3,
      ),
    )
    const mat = new THREE.LineBasicMaterial({ color: '#ffd06044', transparent: true, opacity: 0.3 })
    return new THREE.Line(geo, mat)
  }, [positions, highlightedIdx])

  return (
    <group>
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
      {linePrimitive && <primitive object={linePrimitive} />}
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
