import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['radash'],
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  experimental: {
    swcEnvOptions: {
      mode: 'entry',
      coreJs: '3.49',
      shippedProposals: true,
      forceAllTransforms: true,
    },
    useLightningcss: true,
    lightningCssFeatures: {
      include: [
        'selectors',
        'media-queries',
        'colors',
        'logical-properties',
        'vendor-prefixes',
      ],
    },
    turbopackPluginRuntimeStrategy: 'workerThreads',
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
}

export default nextConfig
