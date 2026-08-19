import { starterRouteId } from '@/features/learning-routes/content/hsk3-level-1-starter'
import { createEmptyLearningState } from '@/features/learning-state/model/learning-state'
import {
  learningCapabilitiesSchema,
  learningStateSchema,
  type LearningCapabilities,
  type LearningState,
} from '@/features/learning-state/model/learning-state-schema'
import { createLearningStore } from '@/features/learning-state/state/learning-store'

export const learningFixtureIds = [
  'new-learner',
  'active-learner',
  'review-due',
  'mixed-mistakes',
  'course-complete',
  'audio-unavailable',
  'microphone-denied',
  'storage-unavailable',
] as const

export type LearningFixtureId = (typeof learningFixtureIds)[number]

export type LearningFixture = {
  id: LearningFixtureId
  label: string
  description: string
  now: string
  state: LearningState
  capabilities: LearningCapabilities
}

const fixtureNow = '2026-08-19T08:00:00.000Z'
const defaultCapabilities = learningCapabilitiesSchema.parse({
  audio: 'available',
  microphone: 'prompt',
  storage: 'available',
})

function createStartedState(input: {
  completedNodeIds?: string[]
  currentNodeId: string | null
}): LearningState {
  return learningStateSchema.parse({
    ...createEmptyLearningState(),
    goalId: 'guided-hsk-path',
    currentRouteId: starterRouteId,
    routeProgress: {
      [starterRouteId]: {
        routeId: starterRouteId,
        completedNodeIds: input.completedNodeIds ?? [],
        currentNodeId: input.currentNodeId,
        startedAt: '2026-08-17T08:00:00.000Z',
        updatedAt: '2026-08-19T07:30:00.000Z',
      },
    },
  })
}

function withState(
  state: LearningState,
  patch: Partial<LearningState>,
): LearningState {
  return learningStateSchema.parse({ ...state, ...patch })
}

const activeState = withState(
  createStartedState({
    completedNodeIds: ['node-four-tones'],
    currentNodeId: 'node-first-greeting',
  }),
  {
    recentActivity: [
      {
        id: 'activity-four-tones',
        kind: 'lesson-completed',
        label: 'Completed Four tones',
        nodeId: 'node-four-tones',
        occurredAt: '2026-08-19T07:30:00.000Z',
      },
    ],
  },
)

const reviewDueState = withState(
  createStartedState({
    completedNodeIds: ['node-four-tones', 'node-first-greeting'],
    currentNodeId: 'node-first-words',
  }),
  {
    reviewQueue: [
      {
        id: 'review-tone-two',
        lessonId: 'four-tones',
        sourceNodeId: 'node-four-tones',
        knowledgeId: 'pinyin.tone-shapes.tone2',
        label: 'Rising tone recognition',
        dueAt: '2026-08-19T06:00:00.000Z',
        status: 'queued',
        attemptCount: 1,
      },
      {
        id: 'review-ni-hao',
        lessonId: 'first-greeting',
        sourceNodeId: 'node-first-greeting',
        knowledgeId: 'dialogue.greeting-ni-hao',
        label: 'Greeting meaning',
        dueAt: '2026-08-19T07:00:00.000Z',
        status: 'queued',
        attemptCount: 2,
      },
    ],
    recentActivity: activeState.recentActivity,
  },
)

const mixedMistakesState = withState(activeState, {
  mistakes: [
    {
      id: 'mistake-tone-three',
      lessonId: 'four-tones',
      nodeId: 'node-four-tones',
      knowledgeId: 'pinyin.tone-shapes.tone3',
      prompt: 'Identify the dipping tone.',
      correction: 'The third tone falls before it rises.',
      occurredAt: '2026-08-18T09:10:00.000Z',
      resolved: false,
    },
    {
      id: 'mistake-greeting-order',
      lessonId: 'first-greeting',
      nodeId: 'node-first-greeting',
      knowledgeId: 'dialogue.greeting-ni-hao',
      prompt: 'Choose the natural greeting order.',
      correction: 'Use 你好 as the complete greeting.',
      occurredAt: '2026-08-19T07:20:00.000Z',
      resolved: false,
    },
    {
      id: 'mistake-tone-one-resolved',
      lessonId: 'four-tones',
      nodeId: 'node-four-tones',
      knowledgeId: 'pinyin.tone-shapes.tone1',
      prompt: 'Identify the high level tone.',
      correction: 'The first tone stays high and level.',
      occurredAt: '2026-08-17T09:00:00.000Z',
      resolved: true,
    },
  ],
})

const completeState = withState(
  createStartedState({
    completedNodeIds: [
      'node-four-tones',
      'node-first-greeting',
      'node-first-words',
      'node-starter-checkpoint',
    ],
    currentNodeId: null,
  }),
  {
    recentActivity: [
      {
        id: 'activity-starter-complete',
        kind: 'route-completed',
        label: 'Completed HSK 3.0 Level 1',
        nodeId: 'node-starter-checkpoint',
        occurredAt: '2026-08-19T07:30:00.000Z',
      },
    ],
  },
)

const fixtureMap = {
  'new-learner': {
    id: 'new-learner',
    label: 'New learner',
    description: 'No selected goal and no learning progress.',
    state: createEmptyLearningState(),
    capabilities: defaultCapabilities,
  },
  'active-learner': {
    id: 'active-learner',
    label: 'Active learner',
    description: 'One lesson complete and a greeting lesson ready.',
    state: activeState,
    capabilities: defaultCapabilities,
  },
  'review-due': {
    id: 'review-due',
    label: 'Review due',
    description: 'Two review items are due before the next lesson.',
    state: reviewDueState,
    capabilities: defaultCapabilities,
  },
  'mixed-mistakes': {
    id: 'mixed-mistakes',
    label: 'Mixed mistakes',
    description: 'Unresolved and corrected mistakes appear together.',
    state: mixedMistakesState,
    capabilities: defaultCapabilities,
  },
  'course-complete': {
    id: 'course-complete',
    label: 'Course complete',
    description: 'Every Starter foundations node is complete.',
    state: completeState,
    capabilities: defaultCapabilities,
  },
  'audio-unavailable': {
    id: 'audio-unavailable',
    label: 'Audio unavailable',
    description: 'The route is active while audio playback is unavailable.',
    state: activeState,
    capabilities: { ...defaultCapabilities, audio: 'unavailable' },
  },
  'microphone-denied': {
    id: 'microphone-denied',
    label: 'Microphone denied',
    description: 'The learner has denied microphone permission.',
    state: activeState,
    capabilities: { ...defaultCapabilities, microphone: 'denied' },
  },
  'storage-unavailable': {
    id: 'storage-unavailable',
    label: 'Storage unavailable',
    description: 'Progress falls back to memory for this session.',
    state: createEmptyLearningState(),
    capabilities: { ...defaultCapabilities, storage: 'unavailable' },
  },
} satisfies Record<
  LearningFixtureId,
  Omit<LearningFixture, 'now'>
>

export const learningFixtureOptions = learningFixtureIds.map((id) => ({
  label: fixtureMap[id].label,
  value: id,
}))

export function isLearningFixtureId(
  value: string | null | undefined,
): value is LearningFixtureId {
  return learningFixtureIds.some((fixtureId) => fixtureId === value)
}

export function createLearningFixture(id: LearningFixtureId): LearningFixture {
  const fixture = fixtureMap[id]

  return {
    ...fixture,
    now: fixtureNow,
    state: learningStateSchema.parse(fixture.state),
    capabilities: learningCapabilitiesSchema.parse(fixture.capabilities),
  }
}

export function createFixtureStore(id: LearningFixtureId) {
  const fixture = createLearningFixture(id)

  return createLearningStore({
    state: fixture.state,
    now: fixture.now,
    hydration: {
      status: fixture.capabilities.storage === 'unavailable' ? 'degraded' : 'ready',
      source: 'fixture',
      diagnostic:
        fixture.capabilities.storage === 'unavailable'
          ? 'Browser storage is unavailable. Progress is held in memory.'
          : null,
    },
    scenario: {
      fixtureId: fixture.id,
      label: fixture.label,
      capabilities: fixture.capabilities,
    },
  })
}
