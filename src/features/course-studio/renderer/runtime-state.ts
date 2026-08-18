import type { SceneData } from '../scene-schema/scene-schema'
import type {
  InteractionAttempt,
  PlayerContext,
  SceneProgress,
} from '../scene-schema/runtime-schema'
import type { JsonValue, TargetLocator } from '../scene-schema/shared'

type CreateAttemptInput = {
  interactionId: string
  answer?: JsonValue
  isCorrect: boolean | null
  playheadMs: number
  targetLocator?: TargetLocator
  submittedAt?: string
}

type EvaluateProgressInput = {
  sceneId: string
  context: PlayerContext
  scene: SceneData
  attempts: InteractionAttempt[]
  maxPlayedTimeMs: number
  timelineComplete: boolean
  started: boolean
}

export function createInteractionAttempt(
  attempts: InteractionAttempt[],
  input: CreateAttemptInput,
): InteractionAttempt {
  const attemptNo = attempts.reduce(
    (highest, attempt) =>
      attempt.interactionId === input.interactionId
        ? Math.max(highest, attempt.attemptNo)
        : highest,
    0,
  ) + 1

  return {
    interactionId: input.interactionId,
    attemptNo,
    answer: input.answer,
    isCorrect: input.isCorrect,
    playheadMs: Math.max(0, Math.round(input.playheadMs)),
    submittedAt: input.submittedAt ?? new Date().toISOString(),
    targetLocator: input.targetLocator,
  }
}

export function getLatestAttempts(attempts: InteractionAttempt[]) {
  const latest = new Map<string, InteractionAttempt>()
  for (const attempt of attempts) {
    const current = latest.get(attempt.interactionId)
    if (!current || attempt.attemptNo > current.attemptNo) {
      latest.set(attempt.interactionId, attempt)
    }
  }
  return latest
}

export function evaluateSceneProgress({
  sceneId,
  context,
  scene,
  attempts,
  maxPlayedTimeMs,
  timelineComplete,
  started,
}: EvaluateProgressInput): SceneProgress {
  const latestAttempts = getLatestAttempts(attempts)
  const completedInteractionIds = [...latestAttempts.keys()]
  const correctInteractionIds = [...latestAttempts.values()]
    .filter((attempt) => attempt.isCorrect === true)
    .map((attempt) => attempt.interactionId)
  const completedSet = new Set(completedInteractionIds)
  const correctSet = new Set(correctInteractionIds)
  const isComplete = evaluateCompletionRule(
    scene,
    completedSet,
    correctSet,
    maxPlayedTimeMs,
    timelineComplete,
  )

  return {
    sceneId,
    context,
    status:
      started && isComplete
        ? 'completed'
        : started
          ? 'inProgress'
          : 'notStarted',
    maxPlayedTimeMs: Math.max(0, Math.round(maxPlayedTimeMs)),
    completedInteractionIds,
    correctInteractionIds,
    attempts,
  }
}

function evaluateCompletionRule(
  scene: SceneData,
  completedInteractionIds: Set<string>,
  correctInteractionIds: Set<string>,
  maxPlayedTimeMs: number,
  timelineComplete: boolean,
) {
  switch (scene.completionRule.kind) {
    case 'manual':
      return false
    case 'viewed':
      return scene.completionRule.minTimelineMs === undefined
        ? timelineComplete
        : maxPlayedTimeMs >= scene.completionRule.minTimelineMs
    case 'allRequiredInteractions':
      return scene.interactions
        .filter((interaction) => interaction.required)
        .every((interaction) => completedInteractionIds.has(interaction.id))
    case 'specificInteractions':
      return scene.completionRule.interactionIds.every((interactionId) =>
        completedInteractionIds.has(interactionId),
      )
    case 'minCorrect':
      return (
        scene.completionRule.interactionIds.filter((interactionId) =>
          correctInteractionIds.has(interactionId),
        ).length >= scene.completionRule.minCorrect
      )
  }
}
