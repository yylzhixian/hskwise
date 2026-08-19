import type { ReactNode } from 'react'

import { LearningShell } from '@/features/learning-shell/components/learning-shell'

export default function Layout({ children }: { children: ReactNode }) {
  return <LearningShell>{children}</LearningShell>
}
