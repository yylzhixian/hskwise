import { fourTonesLesson } from './pinyin/content/four-tones'
import type { PinyinLessonDefinition } from './pinyin/model/pinyin-lesson-schema'

export type PublishedLessonDefinition = PinyinLessonDefinition

const publishedLessons = new Map<string, PublishedLessonDefinition>([
  [fourTonesLesson.id, fourTonesLesson],
])

export function getPublishedLesson(lessonId: string) {
  return publishedLessons.get(lessonId) ?? null
}
