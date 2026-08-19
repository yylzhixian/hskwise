import type { NextConfig } from 'next'
import {
  PHASE_DEVELOPMENT_SERVER,
  type PHASE_TYPE,
} from 'next/constants'

export default function getNextConfig(phase: PHASE_TYPE): NextConfig {
  return {
    reactCompiler: true,
    transpilePackages: ['radash'],
    experimental: {
      swcEnvOptions: {
        mode: 'entry',
        coreJs: '3.49',
        shippedProposals: true,
        forceAllTransforms: true,
      },
      // Dev PostCSS is unstable in worker threads; builds use them for restricted CI runners.
      turbopackPluginRuntimeStrategy:
        phase === PHASE_DEVELOPMENT_SERVER
          ? 'childProcesses'
          : 'workerThreads',
    },
  }
}
