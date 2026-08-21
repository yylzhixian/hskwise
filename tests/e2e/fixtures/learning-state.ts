import type { Page } from '@playwright/test'

import type { LearningState } from '../../../src/store/learning/model/learning-state-schema'
import { learningStorageKey } from '../../../src/store/learning/storage/learning-storage'

export function createReturningLearningState(): LearningState {
  return {
    version: 2,
    goalId: 'guided-hsk-path',
    currentRouteId: 'hsk3-level-1-starter',
    routeProgress: {
      'hsk3-level-1-starter': {
        routeId: 'hsk3-level-1-starter',
        completedNodeIds: [
          'node-four-tones',
          'node-first-greeting',
          'node-first-words',
        ],
        currentNodeId: 'node-starter-checkpoint',
        startedAt: '2026-08-19T08:00:00.000Z',
        updatedAt: '2026-08-20T08:00:00.000Z',
      },
    },
    mistakes: [
      {
        id: 'mistake:first-words:recall:answer:word.name',
        lessonId: 'first-words',
        nodeId: 'node-first-words',
        stepId: 'recall',
        interactionId: 'recall:answer',
        knowledgeId: 'word.name',
        prompt: 'How do you say “name” in Mandarin?',
        correction: '名字 (míngzi) means “name”.',
        acceptedAnswers: ['名字', 'míngzi', '名字 míngzi'],
        occurredAt: '2026-08-20T08:05:00.000Z',
        resolved: false,
      },
      {
        id: 'mistake:four-tones:shape:answer:tone1',
        lessonId: 'four-tones',
        nodeId: 'node-four-tones',
        stepId: 'shape',
        interactionId: 'shape:answer',
        knowledgeId: 'pinyin.tone-shapes.tone1',
        prompt: 'Which pitch path stays high and level?',
        correction: 'First tone holds one high pitch.',
        acceptedAnswers: ['Tone 1', 'First tone'],
        occurredAt: '2026-08-19T08:05:00.000Z',
        resolved: true,
      },
    ],
    reviewQueue: [
      {
        id: 'review:first-words:recall:answer:word.name',
        lessonId: 'first-words',
        sourceNodeId: 'node-first-words',
        sourceStepId: 'recall',
        sourceInteractionId: 'recall:answer',
        knowledgeId: 'word.name',
        label: 'Recall 名字',
        dueAt: '2026-08-20T08:05:00.000Z',
        status: 'queued',
        attemptCount: 0,
      },
    ],
    recentActivity: [
      {
        id: 'activity-node-first-words-2026-08-20T08:00:00.000Z',
        kind: 'lesson-completed',
        label: 'Completed First words',
        nodeId: 'node-first-words',
        occurredAt: '2026-08-20T08:00:00.000Z',
      },
    ],
  }
}

export function createFirstWordsLearningState(): LearningState {
  const state = createReturningLearningState()
  state.routeProgress['hsk3-level-1-starter'] = {
    ...state.routeProgress['hsk3-level-1-starter'],
    completedNodeIds: ['node-four-tones', 'node-first-greeting'],
    currentNodeId: 'node-first-words',
  }
  state.mistakes = []
  state.reviewQueue = []
  state.recentActivity = []
  return state
}

export function createCheckpointLearningState(): LearningState {
  const state = createReturningLearningState()
  state.mistakes = []
  state.reviewQueue = []
  state.recentActivity = []
  return state
}

export async function seedLearningState(
  page: Page,
  state = createReturningLearningState(),
) {
  await page.goto('/')
  await page.evaluate(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: learningStorageKey, value: JSON.stringify(state) },
  )
}
