import { starterCheckpoint } from './checkpoint/content/starter-checkpoint'
import type { CheckpointDefinition } from './checkpoint/model/checkpoint-schema'
import { fourTonesLesson } from './pinyin/content/four-tones'
import type { PinyinLessonDefinition } from './pinyin/model/pinyin-lesson-schema'

export type PublishedLessonDefinition =
  | CheckpointDefinition
  | PinyinLessonDefinition

const publishedLessons = new Map<string, PublishedLessonDefinition>([
  [fourTonesLesson.id, fourTonesLesson],
  [starterCheckpoint.id, starterCheckpoint],
])

export function getPublishedLesson(lessonId: string) {
  return publishedLessons.get(lessonId) ?? null
}
