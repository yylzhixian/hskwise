import type { SceneAction } from './action-schema'
import type { MockAsset } from './project-schema'
import type { SceneData } from './scene-schema'
import type { TimelineStep } from './timeline-schema'

export const minimumTimelineClipDuration = 400

export function getClipDuration(
  step: TimelineStep,
  action: SceneAction | undefined,
  assetsById?: ReadonlyMap<string, MockAsset>,
) {
  if (step.durationMs !== undefined) {
    return Math.max(minimumTimelineClipDuration, step.durationMs)
  }
  if (action && 'durationMs' in action && action.durationMs !== undefined) {
    return Math.max(minimumTimelineClipDuration, action.durationMs)
  }
  if (action?.kind === 'playAudio') {
    const assetDuration = action.assetId
      ? assetsById?.get(action.assetId)?.durationMs
      : undefined
    const mediaStart = action.startMs ?? 0
    const mediaEnd = action.endMs ?? assetDuration ?? undefined
    if (mediaEnd !== undefined && mediaEnd > mediaStart) {
      return Math.max(minimumTimelineClipDuration, mediaEnd - mediaStart)
    }
    return 1_200
  }
  return minimumTimelineClipDuration
}

export function getTimelineDuration(
  scene: SceneData,
  assetsById?: ReadonlyMap<string, MockAsset>,
) {
  const actionsById = new Map(
    scene.actions.map((action) => [action.id, action]),
  )

  return Math.max(
    0,
    ...scene.timeline.map(
      (step) =>
        step.at + getClipDuration(step, actionsById.get(step.actionId), assetsById),
    ),
  )
}
