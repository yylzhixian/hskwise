import type { ReactNode } from 'react'

import { LessonExperienceLoading } from '@/features/lesson-runtime/components/lesson-experience-loading'
import { LearningStoreProvider } from '@/features/learning-state/provider/learning-store-provider'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <LearningStoreProvider
      fallback={<LessonExperienceLoading />}
      showScenarioSwitcher={false}
    >
      {children}
    </LearningStoreProvider>
  )
}
