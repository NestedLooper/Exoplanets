'use client'

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { planetVert, starFrag } from './shaders'

// Spectral type → RGB colour
const SPEC_RGB: Record<string, [number, number, number]> = {
  O: [0.53, 0.67, 1.00],
  B: [0.70, 0.83, 1.00],
  A: [0.95, 0.97, 1.00],
  F: [1.00, 0.98, 0.87],
  G: [1.00, 0.93, 0.65],
  K: [1.00, 0.72, 0.35],
  M: [1.00, 0.42, 0.18],
}

// Normalised temperature: M=0.10 … O=1.0
const TEMP_NORM: Record<string, number> = {
  O: 1.00, B: 0.85, A: 0.65, F: 0.50, G: 0.38, K: 0.25, M: 0.10,
}

function spectralColor(specType: string | null): THREE.Color {
  const t = (specType ?? 'G')[0].toUpperCase()
  const [r, g, b] = SPEC_RGB[t] ?? SPEC_RGB['G']
  return new THREE.Color(r, g, b)
}

function spectralTempNorm(specType: string | null): number {
  const t = (specType ?? 'G')[0].toUpperCase()
  return TEMP_NORM[t] ?? TEMP_NORM['G']
}

const StarCoreMaterial = shaderMaterial(
  {
    uSeed:     0.5,
    uTime:     0.0,
    uColor:    new THREE.Color(1, 0.93, 0.65),
    uTempNorm: 0.38,
  },
  planetVert,
  starFrag,
)

extend({ StarCoreMaterial })

export interface StarProps {
  specType?: string | null
  large?: boolean
}

export function Star({ specType = 'G', large = false }: StarProps) {
  const coreRef  = useRef<THREE.ShaderMaterial>(null!)
  const glowRef  = useRef<THREE.Mesh>(null!)

  const color    = useMemo(() => spectralColor(specType), [specType])
  const tempNorm = useMemo(() => spectralTempNorm(specType), [specType])
  const seed     = useMemo(() => {
    // Deterministic seed from spec type character
    const c = (specType ?? 'G').charCodeAt(0)
    return (c * 137.508) % 1.0
  }, [specType])

  const radius = large ? 1.8 : 0.9

  useFrame((state) => {
    if (!glowRef.current) return
    const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.03 + 1.0
    glowRef.current.scale.setScalar(pulse)
    if (coreRef.current) {
      coreRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const glowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.20,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [color],
  )

  return (
    <group>
      {/* Plasma surface */}
      <mesh>
        <sphereGeometry args={[radius, large ? 128 : 64, large ? 128 : 64]} />
        {/* @ts-expect-error — starCoreMaterial registered via extend */}
        <starCoreMaterial
          ref={coreRef}
          uSeed={seed}
          uColor={color}
          uTempNorm={tempNorm}
        />
      </mesh>

      {/* Outer glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.4, 32, 32]} />
        <primitive object={glowMat} attach="material" />
      </mesh>

      <pointLight color={color} intensity={2.5} distance={20} />
    </group>
  )
}
