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

const defaultUniforms = {
  uSeed: 0.5,
  uTemp: 300.0,
  uTime: 0.0,
  uLightDir: new THREE.Vector3(1, 1, 1),
  uLightColor: new THREE.Color(1, 1, 1),
}

const RockyMaterial      = shaderMaterial(defaultUniforms, planetVert, rockyFrag)
const GasGiantMaterial   = shaderMaterial(defaultUniforms, planetVert, gasGiantFrag)
const HotJupiterMaterial = shaderMaterial(defaultUniforms, planetVert, hotJupiterFrag)
const OceanMaterial      = shaderMaterial(defaultUniforms, planetVert, oceanFrag)
const EarthLikeMaterial  = shaderMaterial(defaultUniforms, planetVert, earthLikeFrag)
const SubNeptuneMaterial = shaderMaterial(defaultUniforms, planetVert, subNeptuneFrag)

extend({
  RockyMaterial,
  GasGiantMaterial,
  HotJupiterMaterial,
  OceanMaterial,
  EarthLikeMaterial,
  SubNeptuneMaterial,
})

function CloudSphere({ radius, seed }: { radius: number; seed: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.05
  })
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.95, 0.97, 1.0),
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    []
  )
  return (
    <mesh ref={meshRef} renderOrder={1}>
      <sphereGeometry args={[radius * 1.018, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

export interface PlanetProps {
  name: string
  type: PlanetType
  temp?: number
  lightDir?: THREE.Vector3
  lightColor?: THREE.Color
  large?: boolean
}

const VISUAL_RADIUS_DETAIL = 1.8
const VISUAL_RADIUS_CARD   = 0.9

export function Planet({
  name,
  type,
  temp = 300,
  lightDir = new THREE.Vector3(1.2, 1.0, 1.5),
  lightColor = new THREE.Color(1, 0.98, 0.92),
  large = false,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.ShaderMaterial>(null!)

  const seed   = planetSeedNorm(name)
  const radius = large ? VISUAL_RADIUS_DETAIL : VISUAL_RADIUS_CARD
  const hasClouds = type === 'earth-like' || type === 'ocean-world'

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.08
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const uniformValues = {
    uSeed: seed,
    uTemp: temp,
    uLightDir: lightDir,
    uLightColor: lightColor,
  }

  const materialJsx = useMemo(() => {
    const sharedProps = { ref: matRef, ...uniformValues }
    switch (type) {
      case 'rocky':       return <rockyMaterial      {...sharedProps} />
      case 'gas-giant':   return <gasGiantMaterial   {...sharedProps} />
      case 'hot-jupiter': return <hotJupiterMaterial {...sharedProps} />
      case 'ocean-world': return <oceanMaterial      {...sharedProps} />
      case 'earth-like':  return <earthLikeMaterial  {...sharedProps} />
      case 'sub-neptune': return <subNeptuneMaterial {...sharedProps} />
      case 'unknown':
      default:            return <rockyMaterial      {...sharedProps} uTemp={200} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, seed, temp])

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 128, 128]} />
        {materialJsx}
      </mesh>
      {hasClouds && <CloudSphere radius={radius} seed={seed} />}
    </group>
  )
}
