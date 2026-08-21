import firstGreetingInput from './lessons/first-greeting.v2.json'
import firstWordsInput from './lessons/first-words.v2.json'

import { compileLessonV2 } from '../compiler/compile-lesson-v2'
import {
  type ResolvedLessonResources,
  resolveLessonResources,
} from '../compiler/resolve-lesson-resources'
import { parseLessonV2 } from '../compiler/validate-lesson-v2'
import type { LessonV2 } from '../schema/lesson-schema'
import type { LessonDefinition } from '@/learning/runtime/model/lesson-definition'

export type LessonV2Definition = {
  lesson: LessonV2
  resources: ResolvedLessonResources
  runtime: LessonDefinition
}

const firstGreeting = parseLessonV2(firstGreetingInput)
const firstWords = parseLessonV2(firstWordsInput)
const greetingContext = { dependencies: [] }
const wordsContext = { dependencies: [firstGreeting] }

const lessons = new Map<string, LessonV2Definition>([
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

export function getLessonV2Definition(lessonId: string) {
  return lessons.get(lessonId) ?? null
}
