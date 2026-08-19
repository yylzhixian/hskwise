'use client'

import { useAtomValue } from 'jotai'

import { lessonSessionSummaryAtom } from '../atoms/lesson-selector-atoms'

export function useLessonSession() {
  return useAtomValue(lessonSessionSummaryAtom)
}
