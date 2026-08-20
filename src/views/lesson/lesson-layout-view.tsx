import type { ReactNode } from 'react'

import { LearningStoreProvider } from '@/store/learning/learning-store-provider'

import { LessonLoadingView } from './lesson-loading-view'

export function LessonLayoutView({ children }: { children: ReactNode }) {
  return (
    <LearningStoreProvider fallback={<LessonLoadingView />}>
      {children}
    </LearningStoreProvider>
  )
}
