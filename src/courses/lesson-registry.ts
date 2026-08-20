import { firstGreetingLesson } from './dialogue/content/first-greeting'
import type { DialogueLessonDefinition } from './dialogue/model/dialogue-lesson-schema'
import { fourTonesLesson } from './pinyin/content/four-tones'
import type { PinyinLessonDefinition } from './pinyin/model/pinyin-lesson-schema'

export type PublishedLessonDefinition =
  | PinyinLessonDefinition
  | DialogueLessonDefinition

const publishedLessons = new Map<string, PublishedLessonDefinition>([
  [fourTonesLesson.id, fourTonesLesson],
  [firstGreetingLesson.id, firstGreetingLesson],
])

export function getPublishedLesson(lessonId: string) {
  return publishedLessons.get(lessonId) ?? null
}
