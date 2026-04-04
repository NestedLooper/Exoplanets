import type * as THREE from 'three'

type ShaderMaterialProps = Partial<THREE.ShaderMaterial> & {
  ref?: React.Ref<THREE.ShaderMaterial>
  uSeed?: number
  uTemp?: number
  uTime?: number
  uLightDir?: THREE.Vector3
  uLightColor?: THREE.Color
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      rockyMaterial: ShaderMaterialProps
      gasGiantMaterial: ShaderMaterialProps
      hotJupiterMaterial: ShaderMaterialProps
      oceanMaterial: ShaderMaterialProps
      earthLikeMaterial: ShaderMaterialProps
      subNeptuneMaterial: ShaderMaterialProps
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      rockyMaterial: ShaderMaterialProps
      gasGiantMaterial: ShaderMaterialProps
      hotJupiterMaterial: ShaderMaterialProps
      oceanMaterial: ShaderMaterialProps
      earthLikeMaterial: ShaderMaterialProps
      subNeptuneMaterial: ShaderMaterialProps
    }
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      rockyMaterial: ShaderMaterialProps
      gasGiantMaterial: ShaderMaterialProps
      hotJupiterMaterial: ShaderMaterialProps
      oceanMaterial: ShaderMaterialProps
      earthLikeMaterial: ShaderMaterialProps
      subNeptuneMaterial: ShaderMaterialProps
    }
  }
}
