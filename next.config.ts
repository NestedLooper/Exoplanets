import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.glsl': { type: 'raw' },
      '*.vert': { type: 'raw' },
      '*.frag': { type: 'raw' },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source',
    })
    return config
  },
}

export default nextConfig
