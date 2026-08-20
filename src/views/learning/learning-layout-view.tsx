import type { ReactNode } from 'react'

import { LearningShell } from '@/components/learning-shell/learning-shell'
import { LearningStoreProvider } from '@/store/learning/learning-store-provider'

import { LearningLoadingView } from './learning-loading-view'

export function LearningLayoutView({ children }: { children: ReactNode }) {
  return (
    <LearningShell>
      <LearningStoreProvider fallback={<LearningLoadingView />}>
        {children}
      </LearningStoreProvider>
    </LearningShell>
  )
}
