'use client'

import { useAtomValue } from 'jotai'

import { lessonSessionSummaryAtom } from '../atoms/lesson-selector-atoms'
import { useLessonStore } from '../provider/lesson-store-provider'

export function useLessonSession() {
  const store = useLessonStore()
  return useAtomValue(lessonSessionSummaryAtom, { store })
}
