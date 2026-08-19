'use client'

import { Provider } from 'jotai'
import { type ReactNode, useState } from 'react'

import type { LessonDefinition } from '../model/lesson-definition'
import { createLessonStore } from '../state/lesson-store'

export function LessonStoreProvider({
  children,
  definition,
}: {
  children: ReactNode
  definition: LessonDefinition
}) {
  const [store] = useState(() => createLessonStore({ definition }))

  return <Provider store={store}>{children}</Provider>
}
