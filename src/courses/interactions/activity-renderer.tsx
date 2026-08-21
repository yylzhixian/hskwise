'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import type { ActivityRendererProps } from './model/renderer-contract'

type ActivityRendererRegistry = {
  [Type in LessonActivity['type']]: ComponentType<
    ActivityRendererProps<Extract<LessonActivity, { type: Type }>>
  >
}

const ContentExploreRenderer = dynamic(() =>
  import('./renderers/content-explore-renderer').then(
    (module) => module.ContentExploreRenderer,
  ),
)
const AudioExploreRenderer = dynamic(() =>
  import('./renderers/audio-explore-renderer').then(
    (module) => module.AudioExploreRenderer,
  ),
)
const SingleChoiceRenderer = dynamic(() =>
  import('./renderers/single-choice-renderer').then(
    (module) => module.SingleChoiceRenderer,
  ),
)
const OrderingRenderer = dynamic(() =>
  import('./renderers/ordering-renderer').then(
    (module) => module.OrderingRenderer,
  ),
)
const RolePlayRenderer = dynamic(() =>
  import('./renderers/role-play-renderer').then(
    (module) => module.RolePlayRenderer,
  ),
)
const ActiveRecallRenderer = dynamic(() =>
  import('./renderers/active-recall-renderer').then(
    (module) => module.ActiveRecallRenderer,
  ),
)
const ClozeRenderer = dynamic(() =>
  import('./renderers/cloze-renderer').then((module) => module.ClozeRenderer),
)

const activityRendererRegistry = {
  'content-explore/v1': ContentExploreRenderer,
  'audio-explore/v1': AudioExploreRenderer,
  'single-choice/v1': SingleChoiceRenderer,
  'ordering/v1': OrderingRenderer,
  'role-play/v1': RolePlayRenderer,
  'active-recall/v1': ActiveRecallRenderer,
  'cloze/v1': ClozeRenderer,
} satisfies ActivityRendererRegistry

export const registeredActivityTypes = Object.freeze(
  Object.keys(activityRendererRegistry) as LessonActivity['type'][],
)

export function LessonActivityRenderer(
  props: ActivityRendererProps<LessonActivity>,
) {
  const Renderer = activityRendererRegistry[
    props.activity.type
  ] as ComponentType<ActivityRendererProps<LessonActivity>>
  return <Renderer {...props} />
}
