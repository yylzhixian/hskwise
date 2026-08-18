import type {
  CourseStudioProject,
  MockKnowledgeRef,
} from '../scene-schema/project-schema'
import {
  SceneProgressStoreSchema,
  type InteractionAttempt,
  type PlayerContext,
  type SceneProgress,
  type SceneProgressStore,
} from '../scene-schema/runtime-schema'
import type { LocalizedText, TargetLocator } from '../scene-schema/shared'
import { getLatestAttempts } from './runtime-state'

export const courseStudioProgressStorageKey =
  'hskwise.course-studio.progress.v1'

export type SceneProgressById = Record<string, SceneProgress>

export type MockReviewItem = {
  id: string
  sceneId: string
  sceneTitle: LocalizedText
  interactionId: string
  interactionKind: string
  prompt?: LocalizedText
  attempt: InteractionAttempt
  knowledgeRefs: MockKnowledgeRef[]
}

export type UnitProgressSummary = {
  unitId: string
  totalScenes: number
  completedScenes: number
  inProgressScenes: number
  completionPercent: number
}

export type LearningProgressSummary = {
  totalScenes: number
  completedScenes: number
  inProgressScenes: number
  completionPercent: number
  unitProgress: UnitProgressSummary[]
  reviewItems: MockReviewItem[]
}

const targetLocatorKeys = [
  'elementId',
  'interactionId',
  'lineId',
  'sentenceId',
  'paragraphId',
  'questionId',
  'optionId',
  'actionId',
  'timelineId',
] as const satisfies ReadonlyArray<keyof TargetLocator>

export function getProgressStoreKey(
  projectId: string,
  context: PlayerContext,
  sceneId: string,
) {
  return `${projectId}:${context}:${sceneId}`
}

export function getContextSceneProgress(
  project: CourseStudioProject,
  progressStore: SceneProgressStore,
  context: PlayerContext,
): SceneProgressById {
  return Object.fromEntries(
    project.scenes.flatMap((scene) => {
      const progress =
        progressStore[getProgressStoreKey(project.id, context, scene.id)]
      return progress ? [[scene.id, progress]] : []
    }),
  )
}

export function summarizeLearningProgress(
  project: CourseStudioProject,
  progressBySceneId: SceneProgressById,
): LearningProgressSummary {
  const unitProgress = project.units.map((unit) => {
    const sectionIds = new Set(
      project.sections
        .filter((section) => section.unitId === unit.id)
        .map((section) => section.id),
    )
    const scenes = project.scenes.filter((scene) =>
      sectionIds.has(scene.sectionId),
    )
    const completedScenes = scenes.filter(
      (scene) => progressBySceneId[scene.id]?.status === 'completed',
    ).length
    const inProgressScenes = scenes.filter(
      (scene) => progressBySceneId[scene.id]?.status === 'inProgress',
    ).length

    return {
      unitId: unit.id,
      totalScenes: scenes.length,
      completedScenes,
      inProgressScenes,
      completionPercent: getCompletionPercent(completedScenes, scenes.length),
    }
  })
  const completedScenes = project.scenes.filter(
    (scene) => progressBySceneId[scene.id]?.status === 'completed',
  ).length
  const inProgressScenes = project.scenes.filter(
    (scene) => progressBySceneId[scene.id]?.status === 'inProgress',
  ).length

  return {
    totalScenes: project.scenes.length,
    completedScenes,
    inProgressScenes,
    completionPercent: getCompletionPercent(
      completedScenes,
      project.scenes.length,
    ),
    unitProgress,
    reviewItems: getReviewItems(project, progressBySceneId),
  }
}

export function parseStoredProgress(value: string) {
  try {
    return SceneProgressStoreSchema.safeParse(JSON.parse(value))
  } catch {
    return SceneProgressStoreSchema.safeParse(undefined)
  }
}

export function isSameSceneProgress(
  left: SceneProgress | undefined,
  right: SceneProgress,
) {
  if (!left) return false
  if (
    left.sceneId !== right.sceneId ||
    left.context !== right.context ||
    left.status !== right.status ||
    left.maxPlayedTimeMs !== right.maxPlayedTimeMs ||
    !arraysEqual(left.completedInteractionIds, right.completedInteractionIds) ||
    !arraysEqual(left.correctInteractionIds, right.correctInteractionIds)
  ) {
    return false
  }
  if (left.attempts === right.attempts) return true
  return JSON.stringify(left.attempts) === JSON.stringify(right.attempts)
}

export function removeSceneProgress(
  progressStore: SceneProgressStore,
  projectId: string,
  sceneId: string,
) {
  const next = { ...progressStore }
  delete next[getProgressStoreKey(projectId, 'editor', sceneId)]
  delete next[getProgressStoreKey(projectId, 'learner', sceneId)]
  return next
}

function getReviewItems(
  project: CourseStudioProject,
  progressBySceneId: SceneProgressById,
) {
  return project.scenes
    .flatMap((scene) => {
      const progress = progressBySceneId[scene.id]
      if (!progress) return []
      const interactionsById = new Map(
        scene.sceneData.interactions.map((interaction) => [
          interaction.id,
          interaction,
        ]),
      )

      return [...getLatestAttempts(progress.attempts).values()].flatMap(
        (attempt) => {
          if (attempt.isCorrect !== false) return []
          const interaction = interactionsById.get(attempt.interactionId)
          if (!interaction) return []
          const targetLocator =
            attempt.targetLocator ??
            interaction.targetLocator ??
            ({ interactionId: interaction.id } satisfies TargetLocator)
          const knowledgeRefs = project.mockKnowledgeRefs.filter(
            (ref) =>
              ref.sceneId === scene.id &&
              targetLocatorsOverlap(ref.targetLocator, targetLocator),
          )

          return [
            {
              id: `${scene.id}:${attempt.interactionId}`,
              sceneId: scene.id,
              sceneTitle: scene.title,
              interactionId: attempt.interactionId,
              interactionKind: interaction.kind,
              prompt: interaction.prompt,
              attempt,
              knowledgeRefs,
            },
          ]
        },
      )
    })
    .toSorted(
      (left, right) =>
        Date.parse(right.attempt.submittedAt) -
        Date.parse(left.attempt.submittedAt),
    )
}

function targetLocatorsOverlap(
  reference: TargetLocator | undefined,
  attempt: TargetLocator,
) {
  if (!reference) return true
  return targetLocatorKeys.some(
    (key) => reference[key] !== undefined && reference[key] === attempt[key],
  )
}

function getCompletionPercent(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100)
}

function arraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}
