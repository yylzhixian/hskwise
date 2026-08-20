'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react'

import type { LessonDefinition } from '../model/lesson-definition'
import {
  createLessonStore,
  type LessonStore,
} from '../state/lesson-store'

const LessonStoreContext = createContext<LessonStore | null>(null)

export function LessonStoreProvider({
  children,
  definition,
}: {
  children: ReactNode
  definition: LessonDefinition
}) {
  const [store] = useState(() => createLessonStore({ definition }))

  return (
    <LessonStoreContext.Provider value={store}>
      {children}
    </LessonStoreContext.Provider>
  )
}

export function useLessonStore() {
  const store = useContext(LessonStoreContext)
  if (!store) {
    throw new Error('useLessonStore must be used within LessonStoreProvider')
  }
  return store
}
