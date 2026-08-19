import type { ReactNode } from 'react'

import { LearningExperienceLoading } from '@/features/learning-routes/components/learning-experience-loading'
import { LearningShell } from '@/features/learning-shell/components/learning-shell'
import { LearningStoreProvider } from '@/features/learning-state/provider/learning-store-provider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <LearningShell>
      <LearningStoreProvider fallback={<LearningExperienceLoading />}>
        {children}
      </LearningStoreProvider>
    </LearningShell>
  )
}
