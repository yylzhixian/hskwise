import type { ReactNode } from 'react'

import { LessonLayoutView } from '@/views/lesson/lesson-layout-view'

export default function Layout({ children }: { children: ReactNode }) {
  return <LessonLayoutView>{children}</LessonLayoutView>
}
