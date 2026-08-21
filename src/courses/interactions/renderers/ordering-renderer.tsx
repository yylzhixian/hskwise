'use client'

import { DialogueLineOrder } from '@/courses/dialogue/components/dialogue-line-order'
import type {
  DialogueLineView,
  DialogueRoleView,
} from '@/courses/interactions/model/activity-view-models'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import type { ActivityRendererProps } from '../model/renderer-contract'

type OrderingActivity = Extract<LessonActivity, { type: 'ordering/v1' }>

const genericRole: DialogueRoleView = {
  id: 'sequence-item',
  name: '',
}

export function OrderingRenderer({
  activity,
  actions,
  resources,
  state,
}: ActivityRendererProps<OrderingActivity>) {
  const rolesById = new Map<string, DialogueRoleView>()
  const lines: DialogueLineView[] = activity.items.flatMap((item) => {
    if (!item.dialogueLineRef) {
      return item.label
        ? [
            {
              id: item.id,
              speakerId: genericRole.id,
              tokens: [{ id: `${item.id}-label`, text: item.label }],
              pinyin: '',
              translation: '',
              audio: { src: '', label: 'No audio' },
            },
          ]
        : []
    }
    const dialogue = resources.dialoguesById[item.dialogueLineRef.dialogueRef]
    const line = dialogue?.lines.find(
      (candidate) => candidate.id === item.dialogueLineRef?.lineRef,
    )
    dialogue?.roles.forEach((role) => rolesById.set(role.id, role))
    return line ? [{ ...line, id: item.id }] : []
  })
  const roles =
    activity.presentation === 'dialogue-lines'
      ? [...rolesById.values()]
      : [genericRole]

  return (
    <DialogueLineOrder
      description={
        activity.presentation === 'dialogue-lines'
          ? 'Arrange the lines into the order you heard.'
          : 'Arrange the items into a natural sequence.'
      }
      disabled={state.disabled}
      lines={lines}
      onSubmit={({ orderedIds, isCorrect }) =>
        actions.submitResponse({ answer: orderedIds, isCorrect })
      }
      roles={roles}
      step={{
        lineIds: activity.answer,
        prompt: activity.prompt,
        startingOrder: activity.initialOrder,
      }}
    />
  )
}
