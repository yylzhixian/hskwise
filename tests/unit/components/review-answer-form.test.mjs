import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ReviewAnswerForm } from '@/views/review/components/review-answer-form.tsx'

const baseProps = {
  correction: '名字 (míngzi) means “name”.',
  draftAnswer: '',
  onChange: () => {},
  onMarkUnsure: () => {},
  onSubmit: () => {},
}

describe('review answer form', () => {
  test('asks for an answer before enabling comparison', () => {
    const html = renderToStaticMarkup(
      createElement(ReviewAnswerForm, {
        ...baseProps,
        attempt: null,
      }),
    )

    expect(html).toContain('Your answer')
    expect(html).toContain('Check my answer')
    expect(html).toContain('disabled=""')
    expect(html).not.toContain('Reference answer')
  })

  test('shows the learner response beside the reference after submission', () => {
    const html = renderToStaticMarkup(
      createElement(ReviewAnswerForm, {
        ...baseProps,
        attempt: { answer: '名字 míngzi', kind: 'answer' },
        draftAnswer: '名字 míngzi',
      }),
    )

    expect(html).toContain('名字 míngzi')
    expect(html).toContain('Reference answer')
    expect(html).toContain('名字 (míngzi) means “name”.')
    expect(html).not.toContain('Needs more review')
    expect(html).not.toContain('My answer matches')
  })
})
