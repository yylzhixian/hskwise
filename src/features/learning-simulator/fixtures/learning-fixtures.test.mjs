import { describe, expect, test } from 'bun:test'

import { completeRouteNodeAtom } from '@/features/learning-state/atoms/learning-action-atoms'
import { starterRouteOverviewAtom } from '@/features/learning-state/atoms/learning-selector-atoms'
import { learningStateSchema } from '@/features/learning-state/model/learning-state-schema'

import {
  createFixtureStore,
  createLearningFixture,
  learningFixtureIds,
} from './learning-fixtures'

describe('learning fixtures', () => {
  test('provides eight schema-valid scenarios', () => {
    expect(learningFixtureIds).toHaveLength(8)

    for (const fixtureId of learningFixtureIds) {
      const fixture = createLearningFixture(fixtureId)
      expect(learningStateSchema.safeParse(fixture.state).success).toBe(true)
    }
  })

  test('creates isolated stores for every scenario run', () => {
    const firstStore = createFixtureStore('active-learner')
    const secondStore = createFixtureStore('active-learner')

    firstStore.set(completeRouteNodeAtom, 'node-first-greeting')

    expect(firstStore.get(starterRouteOverviewAtom).completedCount).toBe(2)
    expect(secondStore.get(starterRouteOverviewAtom).completedCount).toBe(1)
  })

  test('exposes storage fallback as a degraded fixture', () => {
    const store = createFixtureStore('storage-unavailable')
    const fixture = createLearningFixture('storage-unavailable')

    expect(fixture.capabilities.storage).toBe('unavailable')
    expect(store.get(starterRouteOverviewAtom).completedCount).toBe(0)
  })
})
