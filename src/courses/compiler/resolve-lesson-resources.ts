import type {
  DialogueAudioView,
  DialogueView,
  LexemeView,
} from '../interactions/model/activity-view-models'
import type { LessonV2 } from '../schema/lesson-schema'
import type { MediaResource } from '../schema/resources/media-schema'
import {
  type LessonV2ValidationContext,
  validateLessonV2,
} from './validate-lesson-v2'

export type ResolvedLessonResources = {
  mediaById: Record<string, MediaResource>
  dialoguesById: Record<string, DialogueView>
  lexemesById: Record<string, LexemeView>
}

export function resolveLessonResources(
  input: unknown,
  context: LessonV2ValidationContext = {},
): ResolvedLessonResources {
  const lesson = validateLessonV2(input, context)
  const lessons = [lesson, ...(context.dependencies ?? [])]
  const mediaById = Object.fromEntries(
    lesson.resources.media.map((media) => [media.id, media]),
  )
  const dialoguesById = Object.fromEntries(
    lesson.resources.dialogues.map((dialogue) => [
      dialogue.id,
      resolveDialogue(dialogue, lesson),
    ]),
  )
  const lexemesById = Object.fromEntries(
    lesson.resources.lexemes.map((lexeme) => {
      const audio = mediaById[lexeme.audioRef]
      const source = lexeme.sourceRef
        ? resolveLexemeSource(lexeme.sourceRef, lessons)
        : undefined
      return [
        lexeme.id,
        {
          id: lexeme.id,
          text: lexeme.text,
          pinyin: lexeme.pinyin,
          meaning: lexeme.meaning,
          usageNote: lexeme.usageNote,
          audio: toAudioView(audio),
          source,
        } satisfies LexemeView,
      ]
    }),
  )

  return { dialoguesById, lexemesById, mediaById }
}

function resolveDialogue(
  dialogue: LessonV2['resources']['dialogues'][number],
  lesson: LessonV2,
): DialogueView {
  const mediaById = new Map(
    lesson.resources.media.map((media) => [media.id, media]),
  )
  return {
    id: dialogue.id,
    roles: dialogue.roles,
    lines: dialogue.lines.map((line) => ({
      id: line.id,
      speakerId: line.speakerId,
      tokens: line.tokens,
      pinyin: line.pinyin,
      translation: line.translation,
      audio: toAudioView(mediaById.get(line.audioRef)),
    })),
  }
}

function resolveLexemeSource(
  sourceRef: NonNullable<
    LessonV2['resources']['lexemes'][number]['sourceRef']
  >,
  lessons: LessonV2[],
) {
  const sourceLesson = lessons.find((lesson) => lesson.id === sourceRef.lessonId)
  const dialogue = sourceLesson?.resources.dialogues.find(
    (item) => item.id === sourceRef.dialogueId,
  )
  const line = dialogue?.lines.find((item) => item.id === sourceRef.lineId)
  const media = sourceLesson?.resources.media.find(
    (item) => item.id === line?.audioRef,
  )
  if (!line) return undefined

  return {
    contextText: line.tokens.map((token) => token.text).join(''),
    contextPinyin: line.pinyin,
    contextTranslation: line.translation,
    contextAudio: toAudioView(media),
  }
}

function toAudioView(media: MediaResource | undefined): DialogueAudioView {
  if (!media) {
    return { src: '', label: 'Unavailable audio', placeholder: true }
  }
  return {
    src: media.src,
    label: media.label,
    placeholder: media.rights.origin === 'generated-placeholder',
  }
}
