import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['radash'],
  experimental: {
    swcEnvOptions: {
      mode: 'entry',
      coreJs: '3.49',
      shippedProposals: true,
      forceAllTransforms: true,
    },
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
}

export default nextConfig
