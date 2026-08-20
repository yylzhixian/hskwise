import type { ReactNode } from 'react'

import { LearningLayoutView } from '@/views/learning/learning-layout-view'

export default function Layout({ children }: { children: ReactNode }) {
  return <LearningLayoutView>{children}</LearningLayoutView>
}
