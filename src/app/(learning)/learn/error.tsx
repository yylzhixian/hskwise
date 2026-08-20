'use client'

import { LearningErrorView } from '@/views/learning/learning-error-view'

export default function Error({ reset }: { reset: () => void }) {
  return <LearningErrorView reset={reset} />
}
