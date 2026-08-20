import { describe, expect, test } from 'bun:test'

import {
  completeRouteNodeAtom,
  startStarterRouteAtom,
} from '@/store/learning/atoms/learning-action-atoms'
import { persistedLearningStateAtom } from '@/store/learning/atoms/learning-selector-atoms'
import { createLearningStore } from '@/store/learning/learning-store'

describe('learning actions', () => {
  test('completes a route node only once', () => {
    const store = createLearningStore({ now: '2026-08-20T08:00:00.000Z' })

    store.set(startStarterRouteAtom)
    store.set(completeRouteNodeAtom, 'node-four-tones')
    store.set(completeRouteNodeAtom, 'node-four-tones')

    const state = store.get(persistedLearningStateAtom)
    expect(
      state.routeProgress['hsk3-level-1-starter'].completedNodeIds,
    ).toEqual(['node-four-tones'])
    expect(state.recentActivity).toHaveLength(1)
    expect(state.recentActivity[0].label).toBe('Completed Four tones')
  })

  test('completes the starter route when the checkpoint is finished', () => {
    const store = createLearningStore({ now: '2026-08-20T08:00:00.000Z' })

    store.set(startStarterRouteAtom)
    for (const nodeId of [
      'node-four-tones',
      'node-first-greeting',
      'node-first-words',
      'node-starter-checkpoint',
    ]) {
      store.set(completeRouteNodeAtom, nodeId)
    }

    const state = store.get(persistedLearningStateAtom)
    expect(state.routeProgress['hsk3-level-1-starter']).toMatchObject({
      completedNodeIds: [
        'node-four-tones',
        'node-first-greeting',
        'node-first-words',
        'node-starter-checkpoint',
      ],
      currentNodeId: null,
    })
    expect(state.recentActivity[0]).toMatchObject({
      kind: 'route-completed',
      nodeId: 'node-starter-checkpoint',
    })
  })
})
