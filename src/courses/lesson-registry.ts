import { starterCheckpoint } from './checkpoint/content/starter-checkpoint'
import type { CheckpointDefinition } from './checkpoint/model/checkpoint-schema'
import { firstGreetingLesson } from './dialogue/content/first-greeting'
import type { DialogueLessonDefinition } from './dialogue/model/dialogue-lesson-schema'
import { fourTonesLesson } from './pinyin/content/four-tones'
import type { PinyinLessonDefinition } from './pinyin/model/pinyin-lesson-schema'
import { firstWordsLesson } from './vocabulary/content/first-words'
import type { VocabularyLessonDefinition } from './vocabulary/model/vocabulary-lesson-schema'

export type PublishedLessonDefinition =
  | CheckpointDefinition
  | PinyinLessonDefinition
  | DialogueLessonDefinition
  | VocabularyLessonDefinition

const publishedLessons = new Map<string, PublishedLessonDefinition>([
  [fourTonesLesson.id, fourTonesLesson],
  [firstGreetingLesson.id, firstGreetingLesson],
  [firstWordsLesson.id, firstWordsLesson],
  [starterCheckpoint.id, starterCheckpoint],
])

export function getPublishedLesson(lessonId: string) {
  return publishedLessons.get(lessonId) ?? null
}
