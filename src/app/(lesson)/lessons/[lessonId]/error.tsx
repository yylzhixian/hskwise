'use client'

import { LessonErrorView } from '@/views/lesson/lesson-error-view'

export default function Error({ reset }: { reset: () => void }) {
  return <LessonErrorView reset={reset} />
}
