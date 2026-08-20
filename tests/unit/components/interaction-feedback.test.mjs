import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { InteractionFeedback } from '@/components/lesson/interaction-feedback.tsx'

describe('interaction feedback', () => {
  test('renders completed learning as a success state', () => {
    const html = renderToStaticMarkup(
      createElement(InteractionFeedback, {
        feedback: {
          kind: 'completion',
          title: 'Every line heard',
          message: 'You listened to the full exchange.',
        },
      }),
    )

    expect(html).toContain('data-feedback-kind="completion"')
    expect(html).toContain('Every line heard')
    expect(html).toContain('bg-route-complete-surface')
  })

  test('renders an incorrect answer as a retry state', () => {
    const html = renderToStaticMarkup(
      createElement(InteractionFeedback, {
        feedback: {
          kind: 'incorrect',
          title: 'Follow the exchange again',
          message: 'Trace both uses of 我叫 before choosing again.',
        },
      }),
    )

    expect(html).toContain('data-feedback-kind="incorrect"')
    expect(html).toContain('Follow the exchange again')
    expect(html).toContain('bg-destructive/10')
  })

  test('renders a saved review item as information instead of an error', () => {
    const html = renderToStaticMarkup(
      createElement(InteractionFeedback, {
        feedback: {
          kind: 'info',
          title: 'Added to review',
          message: 'This word will return in review.',
        },
      }),
    )

    expect(html).toContain('data-feedback-kind="info"')
    expect(html).toContain('Added to review')
    expect(html).not.toContain('bg-destructive/10')
  })
})
