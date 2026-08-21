import type { LessonActivity } from '../schema/activities/lesson-activity-schema'
import {
  type LessonResourceRef,
} from '../schema/base'
import {
  type LessonV2,
  lessonV2Schema,
} from '../schema/lesson-schema'
import type { DialogueResource } from '../schema/resources/dialogue-schema'
import { LessonV2Error, type LessonV2Issue } from './lesson-v2-errors'

export type LessonV2ValidationContext = {
  dependencies?: readonly LessonV2[]
}

const forbiddenAuthoringKeys = new Set([
  'action',
  'actionId',
  'atom',
  'className',
  'code',
  'component',
  'completionRule',
  'interactionId',
  'nodeId',
  'renderer',
  'routeId',
  'script',
  'style',
])

export function parseLessonV2(input: unknown): LessonV2 {
  const safetyIssues = collectForbiddenKeyIssues(input)
  if (safetyIssues.length > 0) {
    throw new LessonV2Error(
      'Lesson JSON contains forbidden implementation fields.',
      safetyIssues,
    )
  }

  const result = lessonV2Schema.safeParse(input)
  if (!result.success) {
    throw new LessonV2Error(
      'Lesson JSON does not match lesson/v2.',
      result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    )
  }
  return result.data
}

export function validateLessonV2(
  input: unknown,
  context: LessonV2ValidationContext = {},
): LessonV2 {
  const lesson = parseLessonV2(input)
  const issues = collectReferenceIssues(lesson, context)
  if (issues.length > 0) {
    throw new LessonV2Error('Lesson references are invalid.', issues)
  }
  return lesson
}

function collectForbiddenKeyIssues(
  value: unknown,
  path: PropertyKey[] = [],
): LessonV2Issue[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectForbiddenKeyIssues(item, [...path, index]),
    )
  }
  if (!value || typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = [...path, key]
    const isEventHandler = /^on[A-Z]/.test(key)
    const ownIssue =
      forbiddenAuthoringKeys.has(key) || isEventHandler
        ? [{ path: childPath, message: `Forbidden authoring field: ${key}` }]
        : []
    return [...ownIssue, ...collectForbiddenKeyIssues(child, childPath)]
  })
}

function collectReferenceIssues(
  lesson: LessonV2,
  context: LessonV2ValidationContext,
) {
  const issues: LessonV2Issue[] = []
  const knowledgeIds = new Set(
    lesson.objectives.map((objective) => objective.knowledgeId),
  )
  const mediaById = new Map(
    lesson.resources.media.map((resource) => [resource.id, resource]),
  )
  const dialogueById = new Map(
    lesson.resources.dialogues.map((resource) => [resource.id, resource]),
  )
  const lexemeById = new Map(
    lesson.resources.lexemes.map((resource) => [resource.id, resource]),
  )
  const lessonsById = new Map(
    [lesson, ...(context.dependencies ?? [])].map((item) => [item.id, item]),
  )

  if (lesson.type === 'dialogue' && dialogueById.size === 0) {
    addIssue(issues, ['resources', 'dialogues'], 'Dialogue lessons require a dialogue resource.')
  }
  if (lesson.type === 'vocabulary' && lexemeById.size === 0) {
    addIssue(issues, ['resources', 'lexemes'], 'Vocabulary lessons require lexeme resources.')
  }

  lesson.resources.dialogues.forEach((dialogue, dialogueIndex) => {
    const roleIds = new Set(dialogue.roles.map((role) => role.id))
    dialogue.lines.forEach((line, lineIndex) => {
      if (!roleIds.has(line.speakerId)) {
        addIssue(
          issues,
          ['resources', 'dialogues', dialogueIndex, 'lines', lineIndex, 'speakerId'],
          `Unknown dialogue role: ${line.speakerId}`,
        )
      }
      validateMediaRef(
        line.audioRef,
        'audio',
        mediaById,
        issues,
        ['resources', 'dialogues', dialogueIndex, 'lines', lineIndex, 'audioRef'],
      )
      validateKnowledgeIds(
        line.knowledgeIds,
        knowledgeIds,
        issues,
        ['resources', 'dialogues', dialogueIndex, 'lines', lineIndex, 'knowledgeIds'],
      )
    })
  })

  lesson.resources.lexemes.forEach((lexeme, lexemeIndex) => {
    validateMediaRef(
      lexeme.audioRef,
      'audio',
      mediaById,
      issues,
      ['resources', 'lexemes', lexemeIndex, 'audioRef'],
    )
    validateKnowledgeIds(
      [lexeme.knowledgeId],
      knowledgeIds,
      issues,
      ['resources', 'lexemes', lexemeIndex],
      'knowledgeId',
    )
    if (lexeme.sourceRef) {
      validateLexemeSource(
        lexeme,
        lexemeIndex,
        lessonsById,
        issues,
      )
    }
  })

  lesson.steps.forEach((activity, activityIndex) => {
    validateKnowledgeIds(
      activity.knowledgeIds,
      knowledgeIds,
      issues,
      ['steps', activityIndex, 'knowledgeIds'],
    )
    validateActivityReferences(
      activity,
      activityIndex,
      { dialogueById, lexemeById, mediaById },
      issues,
    )
  })

  return issues
}

function validateActivityReferences(
  activity: LessonActivity,
  activityIndex: number,
  resources: {
    dialogueById: Map<string, DialogueResource>
    lexemeById: Map<string, LessonV2['resources']['lexemes'][number]>
    mediaById: Map<string, LessonV2['resources']['media'][number]>
  },
  issues: LessonV2Issue[],
) {
  const path = ['steps', activityIndex] as PropertyKey[]

  if (activity.type === 'content-explore/v1') {
    activity.resourceRefs.forEach((ref, index) => {
      validateResourceRef(ref, resources, issues, [...path, 'resourceRefs', index])
    })
  }

  if (activity.type === 'audio-explore/v1') {
    validateDialogueLines(
      activity.dialogueRef,
      activity.lineRefs,
      resources.dialogueById,
      issues,
      path,
    )
  }

  if (activity.type === 'single-choice/v1' && activity.stimulus) {
    const stimulus = activity.stimulus
    if (stimulus.kind === 'audio') {
      validateMediaRef(
        stimulus.ref,
        'audio',
        resources.mediaById,
        issues,
        [...path, 'stimulus', 'ref'],
      )
    } else if (stimulus.kind === 'dialogue') {
      validateResourceRef(
        { kind: 'dialogue', id: stimulus.ref },
        resources,
        issues,
        [...path, 'stimulus', 'ref'],
      )
    } else if (stimulus.kind === 'lexeme') {
      validateResourceRef(
        { kind: 'lexeme', id: stimulus.ref },
        resources,
        issues,
        [...path, 'stimulus', 'ref'],
      )
    } else {
      validateDialogueLines(
        stimulus.dialogueRef,
        [stimulus.lineRef],
        resources.dialogueById,
        issues,
        [...path, 'stimulus'],
      )
    }
  }

  if (activity.type === 'ordering/v1') {
    activity.items.forEach((item, index) => {
      if (!item.dialogueLineRef) return
      validateDialogueLines(
        item.dialogueLineRef.dialogueRef,
        [item.dialogueLineRef.lineRef],
        resources.dialogueById,
        issues,
        [...path, 'items', index, 'dialogueLineRef'],
      )
    })
  }

  if (activity.type === 'role-play/v1') {
    const dialogue = validateDialogueLines(
      activity.dialogueRef,
      activity.lineRefs,
      resources.dialogueById,
      issues,
      path,
    )
    if (dialogue) {
      const roleIds = new Set(dialogue.roles.map((role) => role.id))
      activity.roleRefs.forEach((roleId, index) => {
        if (!roleIds.has(roleId)) {
          addIssue(
            issues,
            [...path, 'roleRefs', index],
            `Unknown dialogue role: ${roleId}`,
          )
        }
      })
    }
  }

  if (
    activity.type === 'active-recall/v1' &&
    !resources.lexemeById.has(activity.targetRef.id)
  ) {
    addIssue(
      issues,
      [...path, 'targetRef', 'id'],
      `Unknown lexeme resource: ${activity.targetRef.id}`,
    )
  }
}

function validateResourceRef(
  ref: LessonResourceRef,
  resources: {
    dialogueById: Map<string, DialogueResource>
    lexemeById: Map<string, LessonV2['resources']['lexemes'][number]>
    mediaById: Map<string, LessonV2['resources']['media'][number]>
  },
  issues: LessonV2Issue[],
  path: PropertyKey[],
) {
  const exists =
    ref.kind === 'media'
      ? resources.mediaById.has(ref.id)
      : ref.kind === 'dialogue'
        ? resources.dialogueById.has(ref.id)
        : resources.lexemeById.has(ref.id)
  if (!exists) {
    addIssue(issues, [...path, 'id'], `Unknown ${ref.kind} resource: ${ref.id}`)
  }
}

function validateDialogueLines(
  dialogueId: string,
  lineIds: string[],
  dialogues: Map<string, DialogueResource>,
  issues: LessonV2Issue[],
  path: PropertyKey[],
) {
  const dialogue = dialogues.get(dialogueId)
  if (!dialogue) {
    addIssue(issues, [...path, 'dialogueRef'], `Unknown dialogue resource: ${dialogueId}`)
    return undefined
  }
  const availableLineIds = new Set(dialogue.lines.map((line) => line.id))
  lineIds.forEach((lineId, index) => {
    if (!availableLineIds.has(lineId)) {
      addIssue(
        issues,
        [...path, 'lineRefs', index],
        `Unknown dialogue line: ${lineId}`,
      )
    }
  })
  return dialogue
}

function validateMediaRef(
  mediaId: string,
  expectedKind: LessonV2['resources']['media'][number]['kind'],
  mediaById: Map<string, LessonV2['resources']['media'][number]>,
  issues: LessonV2Issue[],
  path: PropertyKey[],
) {
  const media = mediaById.get(mediaId)
  if (!media) {
    addIssue(issues, path, `Unknown media resource: ${mediaId}`)
  } else if (media.kind !== expectedKind) {
    addIssue(
      issues,
      path,
      `Media ${mediaId} must be ${expectedKind}, received ${media.kind}.`,
    )
  }
}

function validateKnowledgeIds(
  ids: string[],
  availableIds: Set<string>,
  issues: LessonV2Issue[],
  path: PropertyKey[],
  field: PropertyKey = 'knowledgeIds',
) {
  ids.forEach((id, index) => {
    if (!availableIds.has(id)) {
      addIssue(
        issues,
        field === 'knowledgeIds' ? [...path, index] : [...path, field],
        `Unknown lesson knowledge id: ${id}`,
      )
    }
  })
}

function validateLexemeSource(
  lexeme: LessonV2['resources']['lexemes'][number],
  lexemeIndex: number,
  lessonsById: Map<string, LessonV2>,
  issues: LessonV2Issue[],
) {
  const source = lexeme.sourceRef
  if (!source) return
  const path = ['resources', 'lexemes', lexemeIndex, 'sourceRef'] as PropertyKey[]
  const sourceLesson = lessonsById.get(source.lessonId)
  if (!sourceLesson) {
    addIssue(issues, [...path, 'lessonId'], `Unknown source lesson: ${source.lessonId}`)
    return
  }
  const dialogue = sourceLesson.resources.dialogues.find(
    (item) => item.id === source.dialogueId,
  )
  if (!dialogue) {
    addIssue(issues, [...path, 'dialogueId'], `Unknown source dialogue: ${source.dialogueId}`)
    return
  }
  const line = dialogue.lines.find((item) => item.id === source.lineId)
  if (!line) {
    addIssue(issues, [...path, 'lineId'], `Unknown source dialogue line: ${source.lineId}`)
    return
  }
  const token = line.tokens.find((item) => item.id === source.tokenId)
  if (!token) {
    addIssue(issues, [...path, 'tokenId'], `Unknown source dialogue token: ${source.tokenId}`)
    return
  }
  if (
    lexeme.text !== token.text ||
    lexeme.pinyin !== token.pinyin ||
    lexeme.meaning !== token.meaning
  ) {
    addIssue(
      issues,
      path,
      'Lexeme text, pinyin, and meaning must match its source dialogue token.',
    )
  }
}

function addIssue(
  issues: LessonV2Issue[],
  path: PropertyKey[],
  message: string,
) {
  issues.push({ path, message })
}
