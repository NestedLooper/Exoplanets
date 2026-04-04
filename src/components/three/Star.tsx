'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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

export interface StarProps {
  specType?: string | null
  large?: boolean
}

export function Star({ specType = 'G', large = false }: StarProps) {
  const glowRef  = useRef<THREE.Mesh>(null!)
  const color    = useMemo(() => spectralColor(specType), [specType])
  const radius   = large ? 1.8 : 0.9

  useFrame((state) => {
    const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 + 1.0
    glowRef.current.scale.setScalar(pulse)
  })

  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.2,
        roughness: 1,
        metalness: 0,
      }),
    [color]
  )

  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [color]
  )

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.35, 32, 32]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
      <pointLight color={color} intensity={2.5} distance={20} />
    </group>
  )
}
