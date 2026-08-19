import { describe, expect, test } from 'bun:test'

import { createLearningFixture } from '@/features/learning-simulator/fixtures/learning-fixtures'

import { starterRoute } from '../content/hsk3-level-1-starter'
import { deriveRouteOverview } from './route-progress'
import { getRouteNodes, learningRouteSchema } from './route-schema'

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
    const fixture = createLearningFixture('new-learner')
    const overview = deriveRouteOverview(
      starterRoute,
      fixture.state,
      fixture.now,
    )

    expect(overview.continueTarget.kind).toBe('start')
    expect(overview.nodeViews.map((view) => view.status)).toEqual([
      'current',
      'locked',
      'locked',
      'locked',
    ])
  })

  test('returns the next lesson for a returning learner', () => {
    const fixture = createLearningFixture('active-learner')
    const overview = deriveRouteOverview(
      starterRoute,
      fixture.state,
      fixture.now,
    )

    expect(overview.continueTarget.kind).toBe('lesson')
    expect(overview.currentNode?.id).toBe('node-first-greeting')
    expect(overview.progressPercent).toBe(25)
  })

  test('prioritizes due review and recognizes route completion', () => {
    const reviewFixture = createLearningFixture('review-due')
    const completeFixture = createLearningFixture('course-complete')

    expect(
      deriveRouteOverview(
        starterRoute,
        reviewFixture.state,
        reviewFixture.now,
      ).continueTarget.kind,
    ).toBe('review')
    expect(
      deriveRouteOverview(
        starterRoute,
        completeFixture.state,
        completeFixture.now,
      ).continueTarget.kind,
    ).toBe('complete')
  })
})
