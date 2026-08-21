import firstGreetingInput from './lessons/first-greeting.v2.json'
import firstWordsInput from './lessons/first-words.v2.json'

import { compileLessonV2 } from '../compiler/compile-lesson-v2'
import {
  type ResolvedLessonResources,
  resolveLessonResources,
} from '../compiler/resolve-lesson-resources'
import { parseLessonV2 } from '../compiler/validate-lesson-v2'
import type { LessonPlacement } from '../interactions/model/renderer-contract'
import type { LessonV2 } from '../schema/lesson-schema'
import type { LessonDefinition } from '@/learning/runtime/model/lesson-definition'

export type LessonV2Pilot = {
  lesson: LessonV2
  placement?: LessonPlacement
  resources: ResolvedLessonResources
  runtime: LessonDefinition
}

const firstGreeting = parseLessonV2(firstGreetingInput)
const firstWords = parseLessonV2(firstWordsInput)
const greetingContext = { dependencies: [] }
const wordsContext = { dependencies: [firstGreeting] }

const pilots = new Map<string, LessonV2Pilot>([
  [
    firstGreeting.id,
    {
      lesson: firstGreeting,
      resources: resolveLessonResources(firstGreeting, greetingContext),
      runtime: compileLessonV2(firstGreeting, greetingContext),
    },
  ],
  [
    firstWords.id,
    {
      lesson: firstWords,
      resources: resolveLessonResources(firstWords, wordsContext),
      runtime: compileLessonV2(firstWords, wordsContext),
    },
  ],
])

export function getLessonV2Pilot(lessonId: string) {
  return pilots.get(lessonId) ?? null
}
