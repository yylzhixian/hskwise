import { describe, expect, test } from 'bun:test'

import { sampleCourseStudioProject } from '../scene-schema/samples.ts'
import {
  createInteractionAttempt,
  evaluateSceneProgress,
} from './runtime-state.ts'
import {
  getContextSceneProgress,
  getProgressStoreKey,
  parseStoredProgress,
  summarizeLearningProgress,
} from './learning-progress.ts'

describe('Course Studio lesson progress', () => {
  test('aggregates scene completion and links the latest wrong answer', () => {
    const scene = sampleCourseStudioProject.scenes[0]
    const attempt = createInteractionAttempt([], {
      interactionId: 'quiz_tone_1',
      answer: { optionIds: ['option_tone_4'] },
      isCorrect: false,
      playheadMs: 3_600,
      submittedAt: '2026-08-18T00:00:00.000Z',
      targetLocator: { interactionId: 'quiz_tone_1' },
    })
    const progress = evaluateSceneProgress({
      sceneId: scene.id,
      context: 'learner',
      scene: scene.sceneData,
      attempts: [attempt],
      maxPlayedTimeMs: 3_600,
      timelineComplete: false,
      started: true,
    })
    const summary = summarizeLearningProgress(sampleCourseStudioProject, {
      [scene.id]: progress,
    })

    expect(summary.completedScenes).toBe(1)
    expect(summary.completionPercent).toBe(33)
    expect(summary.unitProgress[0]).toMatchObject({
      totalScenes: 3,
      completedScenes: 1,
      completionPercent: 33,
    })
    expect(summary.reviewItems).toHaveLength(1)
    expect(summary.reviewItems[0].interactionId).toBe('quiz_tone_1')
    expect(summary.reviewItems[0].knowledgeRefs[0].refId).toBe('tone_1')
  })

  test('a correct retry removes an interaction from review', () => {
    const scene = sampleCourseStudioProject.scenes[0]
    const first = createInteractionAttempt([], {
      interactionId: 'quiz_tone_1',
      isCorrect: false,
      playheadMs: 3_600,
      submittedAt: '2026-08-18T00:00:00.000Z',
    })
    const second = createInteractionAttempt([first], {
      interactionId: 'quiz_tone_1',
      isCorrect: true,
      playheadMs: 3_600,
      submittedAt: '2026-08-18T00:00:01.000Z',
    })
    const progress = evaluateSceneProgress({
      sceneId: scene.id,
      context: 'learner',
      scene: scene.sceneData,
      attempts: [first, second],
      maxPlayedTimeMs: 3_600,
      timelineComplete: false,
      started: true,
    })

    expect(
      summarizeLearningProgress(sampleCourseStudioProject, {
        [scene.id]: progress,
      }).reviewItems,
    ).toEqual([])
  })

  test('stored progress stays isolated by project, context, and scene', () => {
    const scene = sampleCourseStudioProject.scenes[0]
    const progress = evaluateSceneProgress({
      sceneId: scene.id,
      context: 'learner',
      scene: scene.sceneData,
      attempts: [],
      maxPlayedTimeMs: 400,
      timelineComplete: false,
      started: true,
    })
    const key = getProgressStoreKey(
      sampleCourseStudioProject.id,
      'learner',
      scene.id,
    )
    const store = { [key]: progress }

    expect(
      getContextSceneProgress(sampleCourseStudioProject, store, 'learner')[
        scene.id
      ],
    ).toEqual(progress)
    expect(
      getContextSceneProgress(sampleCourseStudioProject, store, 'editor'),
    ).toEqual({})
    expect(parseStoredProgress(JSON.stringify(store)).success).toBe(true)
    expect(parseStoredProgress('{bad json').success).toBe(false)
  })
})
