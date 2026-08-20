'use client'

import { useAtomValue } from 'jotai'

import { lessonSessionSummaryAtom } from '@/learning/runtime/atoms/lesson-selector-atoms'
import { useLessonStore } from '@/learning/runtime/provider/lesson-store-provider'

export function useLessonSession() {
  const store = useLessonStore()
  return useAtomValue(lessonSessionSummaryAtom, { store })
}
