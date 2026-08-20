'use client'

import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import {
  lessonCompletionAtom,
  type LessonCompletion,
} from '@/learning/runtime/atoms/lesson-selector-atoms'
import { useLessonStore } from '@/learning/runtime/provider/lesson-store-provider'

export function useLessonCompletion(
  onComplete?: (completion: LessonCompletion) => void,
) {
  const store = useLessonStore()
  const completion = useAtomValue(lessonCompletionAtom, { store })
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
