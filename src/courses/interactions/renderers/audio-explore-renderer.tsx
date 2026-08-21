'use client'

import { DialogueExplorer } from '@/courses/dialogue/components/dialogue-explorer'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import type { ActivityRendererProps } from '../model/renderer-contract'

type AudioActivity = Extract<LessonActivity, { type: 'audio-explore/v1' }>

export function AudioExploreRenderer({
  activity,
  actions,
  resources,
  state,
}: ActivityRendererProps<AudioActivity>) {
  const dialogue = resources.dialoguesById[activity.dialogueRef]
  if (!dialogue) return null
  const linesById = new Map(dialogue.lines.map((line) => [line.id, line]))
  const lines = activity.lineRefs.flatMap((lineId) => {
    const line = linesById.get(lineId)
    return line ? [line] : []
  })

  return (
    <DialogueExplorer
      completed={state.ready}
      lines={lines}
      onComplete={actions.completeMedia}
      roles={dialogue.roles}
    />
  )
}
