import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PinyinLessonCheck } from '@/courses/pinyin/components/pinyin-lesson-check.tsx'
import { ToneListeningChoice } from '@/courses/pinyin/components/tone-listening-choice.tsx'
import { toneShapeReviewFixture } from '../../fixtures/pinyin/tone-shape-review-fixture.ts'

describe('pinyin lesson components', () => {
  test('renders listening and final-check steps from a second lesson fixture', () => {
    const listeningStep = toneShapeReviewFixture.steps.find(
      (step) => step.kind === 'tone-listening-choice',
    )
    const lessonCheckStep = toneShapeReviewFixture.steps.find(
      (step) => step.kind === 'lesson-check',
    )
    if (!listeningStep || listeningStep.kind !== 'tone-listening-choice') {
      throw new Error('Listening fixture is missing.')
    }
    if (!lessonCheckStep || lessonCheckStep.kind !== 'lesson-check') {
      throw new Error('Lesson-check fixture is missing.')
    }

    const listeningHtml = renderToStaticMarkup(
      createElement(ToneListeningChoice, {
        disabled: false,
        onSubmit: () => {},
        step: listeningStep,
        tones: toneShapeReviewFixture.tones.filter((tone) =>
          listeningStep.optionToneNumbers.includes(tone.number),
        ),
      }),
    )
    const checkHtml = renderToStaticMarkup(
      createElement(PinyinLessonCheck, {
        completed: false,
        onComplete: () => {},
        onIncorrect: () => {},
        step: lessonCheckStep,
        tones: toneShapeReviewFixture.tones,
      }),
    )

    expect(listeningHtml).toContain('Play sample')
    expect(listeningHtml).toContain('TTS placeholder')
    expect(checkHtml).toContain('Question 1 of 5')
    expect(checkHtml).toContain('Which tone stays level?')
  })
})
