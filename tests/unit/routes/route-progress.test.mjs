import { describe, expect, test } from 'bun:test'

import { starterRoute } from '@/learning/routes/content/hsk3-level-1-starter'
import { deriveRouteOverview } from '@/learning/routes/model/route-progress'
import {
  getRouteNodes,
  learningRouteSchema,
} from '@/learning/routes/model/route-schema'
import { createEmptyLearningState } from '@/store/learning/model/learning-state'

const now = '2026-08-20T08:00:00.000Z'

function createRouteState({ complete = false, reviewDue = false } = {}) {
  const state = createEmptyLearningState()
  const nodes = getRouteNodes(starterRoute)
  const completedNodeIds = complete ? nodes.map((node) => node.id) : [nodes[0].id]

  state.currentRouteId = starterRoute.id
  state.routeProgress[starterRoute.id] = {
    routeId: starterRoute.id,
    completedNodeIds,
    currentNodeId: complete ? null : nodes[1].id,
    startedAt: now,
    updatedAt: now,
  }

  if (reviewDue) {
    state.reviewQueue.push({
      id: 'review-four-tones',
      lessonId: nodes[0].lessonId,
      sourceNodeId: nodes[0].id,
      knowledgeId: 'tone-shapes',
      label: 'Four tones',
      dueAt: now,
      status: 'queued',
      attemptCount: 1,
    })
  }

  return state
}

describe('starter route', () => {
  test('keeps the published stable ids in route order', () => {
    expect(learningRouteSchema.parse(starterRoute)).toEqual(starterRoute)
    expect(getRouteNodes(starterRoute).map((node) => node.id)).toEqual([
      'node-four-tones',
      'node-first-greeting',
      'node-first-words',
      'node-starter-checkpoint',
    ])
  })

  test('derives a start target and locks later nodes for a new learner', () => {
    const overview = deriveRouteOverview(starterRoute, createEmptyLearningState(), now)

    expect(overview.continueTarget.kind).toBe('start')
    expect(overview.nodeViews.map((view) => view.status)).toEqual([
      'current',
      'locked',
      'locked',
      'locked',
    ])
  })

  test('returns the next lesson for a returning learner', () => {
    const overview = deriveRouteOverview(starterRoute, createRouteState(), now)

    expect(overview.continueTarget.kind).toBe('lesson')
    expect(overview.currentNode?.id).toBe('node-first-greeting')
    expect(overview.progressPercent).toBe(25)
  })

  test('prioritizes due review and recognizes route completion', () => {
    expect(
      deriveRouteOverview(
        starterRoute,
        createRouteState({ reviewDue: true }),
        now,
      ).continueTarget.kind,
    ).toBe('review')
    expect(
      deriveRouteOverview(
        starterRoute,
        createRouteState({ complete: true }),
        now,
      ).continueTarget.kind,
    ).toBe('complete')
  })
})
