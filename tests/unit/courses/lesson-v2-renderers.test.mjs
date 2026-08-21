import { describe, expect, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { resolveLessonResources } from '@/courses/compiler/resolve-lesson-resources.ts'
import firstGreetingInput from '@/courses/content/lessons/first-greeting.v2.json'
import firstWordsInput from '@/courses/content/lessons/first-words.v2.json'
import starterCheckpointInput from '@/courses/content/lessons/starter-checkpoint.v2.json'
import { getActivityReviewAnswers } from '@/courses/interactions/model/activity-review-answers.ts'
import { ActiveRecallRenderer } from '@/courses/interactions/renderers/active-recall-renderer.tsx'
import { AudioExploreRenderer } from '@/courses/interactions/renderers/audio-explore-renderer.tsx'
import { ClozeRenderer } from '@/courses/interactions/renderers/cloze-renderer.tsx'
import { ContentExploreRenderer } from '@/courses/interactions/renderers/content-explore-renderer.tsx'
import { OrderingRenderer } from '@/courses/interactions/renderers/ordering-renderer.tsx'
import { RolePlayRenderer } from '@/courses/interactions/renderers/role-play-renderer.tsx'
import { SingleChoiceRenderer } from '@/courses/interactions/renderers/single-choice-renderer.tsx'
import { parseLessonV2 } from '@/courses/compiler/validate-lesson-v2.ts'

const firstGreeting = parseLessonV2(firstGreetingInput)
const firstWords = parseLessonV2(firstWordsInput)
const starterCheckpoint = parseLessonV2(starterCheckpointInput)
const greetingResources = resolveLessonResources(firstGreeting)
const wordResources = resolveLessonResources(firstWords, {
  dependencies: [firstGreeting],
})
const checkpointResources = resolveLessonResources(starterCheckpoint, {
  dependencies: [firstGreeting, firstWords],
})
const actions = {
  assessRecall: () => {},
  completeMedia: () => {},
  submitResponse: () => {},
}
const state = { disabled: false, ready: false }

const renderers = {
  'active-recall/v1': ActiveRecallRenderer,
  'audio-explore/v1': AudioExploreRenderer,
  'cloze/v1': ClozeRenderer,
  'content-explore/v1': ContentExploreRenderer,
  'ordering/v1': OrderingRenderer,
  'role-play/v1': RolePlayRenderer,
  'single-choice/v1': SingleChoiceRenderer,
}

describe('lesson/v2 renderers', () => {
  test('renders every registered primitive from the formal JSON lessons', () => {
    const renderedTypes = new Set()

    for (const { lesson, resources } of [
      { lesson: firstGreeting, resources: greetingResources },
      { lesson: firstWords, resources: wordResources },
      { lesson: starterCheckpoint, resources: checkpointResources },
    ]) {
      for (const activity of lesson.steps) {
        const Renderer = renderers[activity.type]
        const html = renderToStaticMarkup(
          createElement(Renderer, { actions, activity, resources, state }),
        )

        expect(html.length).toBeGreaterThan(20)
        renderedTypes.add(activity.type)
      }
    }

    expect([...renderedTypes].sort()).toEqual(Object.keys(renderers).sort())
  })

  test('derives review answers from activity and resource data', () => {
    const listening = firstWords.steps.find(
      (activity) => activity.id === 'first-words-listening',
    )
    const recall = firstWords.steps.find(
      (activity) => activity.id === 'first-words-recall',
    )

    expect(getActivityReviewAnswers(listening, wordResources)).toEqual([
      '也',
      'yě',
      '也 yě',
    ])
    expect(getActivityReviewAnswers(recall, wordResources)).toEqual([
      '高兴',
      'gāoxìng',
      '高兴 gāoxìng',
    ])
  })
})
