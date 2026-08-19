'use client'

import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import {
  lessonCompletionAtom,
  type LessonCompletion,
} from '../atoms/lesson-selector-atoms'

export function useLessonCompletion(
  onComplete?: (completion: LessonCompletion) => void,
) {
  const completion = useAtomValue(lessonCompletionAtom)
  const deliveredEventIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      !completion ||
      completion.eventId === deliveredEventIdRef.current
    ) {
      return
    }

    deliveredEventIdRef.current = completion.eventId
    onComplete?.(completion)
  }, [completion, onComplete])

  return completion
}
