import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { DialogueComprehension } from '@/courses/dialogue/components/dialogue-comprehension.tsx'
import { DialogueExplorer } from '@/courses/dialogue/components/dialogue-explorer.tsx'
import { DialogueLineOrder } from '@/courses/dialogue/components/dialogue-line-order.tsx'
import { evaluateDialoguePractice } from '@/courses/dialogue/components/dialogue-practice-review.tsx'
import { DialogueRolePractice } from '@/courses/dialogue/components/dialogue-role-practice.tsx'
import { hasListenedToAllLines } from '@/courses/dialogue/hooks/use-dialogue-explorer.ts'
import {
  getRolePracticePhase,
  ROLE_RECORDING_COUNTDOWN_SECONDS,
  ROLE_TURN_HANDOFF_DELAY_MS,
} from '@/courses/dialogue/hooks/use-dialogue-role-practice.ts'
import { reorderItems } from '@/hooks/lesson/use-ordering-interaction.ts'
import { askingNameSample } from '../../fixtures/dialogue/asking-name-sample.ts'

const getStep = (kind) => {
  const step = askingNameSample.steps.find((item) => item.kind === kind)
  if (!step) throw new Error(`Missing ${kind} fixture step.`)
  return step
}

describe('dialogue lesson components', () => {
  test('renders the second fixture through semantic dialogue components', () => {
    const explore = getStep('dialogue-explore')
    const comprehension = getStep('comprehension-choice')
    const ordering = getStep('line-order')
    const rolePractice = getStep('role-practice')

    const explorerHtml = renderToStaticMarkup(
      createElement(DialogueExplorer, {
        completed: false,
        lines: askingNameSample.lines,
        onComplete: () => {},
        roles: askingNameSample.roles,
      }),
    )
    const comprehensionHtml = renderToStaticMarkup(
      createElement(DialogueComprehension, {
        disabled: false,
        onSubmit: () => {},
        step: comprehension,
      }),
    )
    const orderingHtml = renderToStaticMarkup(
      createElement(DialogueLineOrder, {
        disabled: false,
        lines: askingNameSample.lines,
        onSubmit: () => {},
        roles: askingNameSample.roles,
        step: ordering,
      }),
    )
    const roleHtml = renderToStaticMarkup(
      createElement(DialogueRolePractice, {
        completed: false,
        lines: askingNameSample.lines,
        onComplete: () => {},
        roles: askingNameSample.roles,
        step: rolePractice,
      }),
    )

    expect(explore.kind).toBe('dialogue-explore')
    expect(explorerHtml).toContain('王老师')
    expect(explorerHtml).toContain('大卫')
    expect(explorerHtml).toContain('0 / 3 listened')
    expect(comprehensionHtml).toContain('Why does David say 您呢?')
    expect(orderingHtml).toContain('Drag line 1 to reorder')
    expect(roleHtml).toContain('Start conversation')
    expect(roleHtml).toContain('record automatically on your turns')
    expect(roleHtml).toContain('TTS placeholder')
  })

  test('completes exploration only after every line has finished playing', () => {
    const [firstLine, secondLine, thirdLine] = askingNameSample.lines

    expect(
      hasListenedToAllLines(new Set([firstLine.id, secondLine.id]), askingNameSample.lines),
    ).toBe(false)
    expect(
      hasListenedToAllLines(
        new Set([firstLine.id, secondLine.id, thirdLine.id]),
        askingNameSample.lines,
      ),
    ).toBe(true)
  })

  test('moves a dialogue line to the dropped position', () => {
    expect(reorderItems(['line-1', 'line-2', 'line-3'], 2, 0)).toEqual([
      'line-3',
      'line-1',
      'line-2',
    ])
  })

  test('maps alternating dialogue media states to visible practice phases', () => {
    expect(
      getRolePracticePhase({
        audioStatus: 'playing',
        countdownRemaining: null,
        handoffPending: false,
        isFinished: false,
        isUserTurn: false,
        recorderStatus: 'idle',
        started: true,
      }),
    ).toBe('playing-partner')
    expect(
      getRolePracticePhase({
        audioStatus: 'idle',
        countdownRemaining: null,
        handoffPending: false,
        isFinished: false,
        isUserTurn: true,
        recorderStatus: 'recording',
        started: true,
      }),
    ).toBe('recording-user')
    expect(
      getRolePracticePhase({
        audioStatus: 'idle',
        countdownRemaining: null,
        handoffPending: false,
        isFinished: true,
        isUserTurn: false,
        recorderStatus: 'recorded',
        started: true,
      }),
    ).toBe('complete')
  })

  test('paces learner turns with countdown and handoff phases', () => {
    expect(ROLE_RECORDING_COUNTDOWN_SECONDS).toBe(3)
    expect(ROLE_TURN_HANDOFF_DELAY_MS).toBe(1000)
    expect(
      getRolePracticePhase({
        audioStatus: 'idle',
        countdownRemaining: 3,
        handoffPending: false,
        isFinished: false,
        isUserTurn: true,
        recorderStatus: 'idle',
        started: true,
      }),
    ).toBe('countdown-user')
    expect(
      getRolePracticePhase({
        audioStatus: 'idle',
        countdownRemaining: null,
        handoffPending: true,
        isFinished: false,
        isUserTurn: true,
        recorderStatus: 'recorded',
        started: true,
      }),
    ).toBe('handoff-user')
  })

  test('evaluates captured dialogue turns without inventing pronunciation scores', () => {
    expect(
      evaluateDialoguePractice(
        ['line-1', 'line-2'],
        [{ lineId: 'line-1' }, { lineId: 'line-2' }],
      ),
    ).toMatchObject({
      expectedCount: 2,
      recordedCount: 2,
      title: 'Complete exchange',
    })
    expect(
      evaluateDialoguePractice(['line-1', 'line-2'], [{ lineId: 'line-1' }]),
    ).toMatchObject({
      expectedCount: 2,
      recordedCount: 1,
      title: 'Exchange complete · recording incomplete',
    })
  })
})
