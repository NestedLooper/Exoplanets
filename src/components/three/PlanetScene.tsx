'use client'

import { Suspense, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function starLightColor(specType: string | null): THREE.Color {
  const t = (specType ?? 'G')[0].toUpperCase()
  const map: Record<string, string> = {
    O: '#88aaff', B: '#b0ccff', A: '#f0f4ff',
    F: '#fff8e0', G: '#fff0c0', K: '#ffd080', M: '#ff9040',
  }
  return new THREE.Color(map[t] ?? map['G'])
}

export interface PlanetSceneProps {
  children: ReactNode
  hostSpecType?: string | null
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
