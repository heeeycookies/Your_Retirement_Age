import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow matter-js and poly-decomp to be bundled client-side only
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent matter-js from being bundled server-side
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('matter-js', 'poly-decomp')
      }
    }
    return config
  },
}

export default nextConfig
