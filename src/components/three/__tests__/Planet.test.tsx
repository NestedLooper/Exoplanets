import React from 'react'
import { render } from '@testing-library/react'

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
  extend: jest.fn(),
  useThree: () => ({ camera: {}, gl: {} }),
}))
jest.mock('@react-three/drei', () => ({
  shaderMaterial: () => class MockMaterial {},
}))
jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation(() => ({ x: 0, y: 0, z: 0 })),
  Color: jest.fn().mockImplementation(() => ({ r: 1, g: 1, b: 1 })),
  Mesh: jest.fn(),
  ShaderMaterial: jest.fn(),
  MeshStandardMaterial: jest.fn().mockImplementation(() => ({})),
  SphereGeometry: jest.fn(),
}))

import { Planet } from '../Planet'

describe('Planet', () => {
  it('renders without throwing', () => {
    expect(() => render(<Planet name="Kepler-442 b" type="rocky" />)).not.toThrow()
  })
})
