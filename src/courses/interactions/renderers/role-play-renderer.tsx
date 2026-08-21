'use client'

import { DialogueRolePractice } from '@/courses/dialogue/components/dialogue-role-practice'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

import type { ActivityRendererProps } from '../model/renderer-contract'

type RolePlayActivity = Extract<LessonActivity, { type: 'role-play/v1' }>

export function RolePlayRenderer({
  activity,
  actions,
  resources,
  state,
}: ActivityRendererProps<RolePlayActivity>) {
  const dialogue = resources.dialoguesById[activity.dialogueRef]
  if (!dialogue) return null
  const linesById = new Map(dialogue.lines.map((line) => [line.id, line]))
  const rolesById = new Map(dialogue.roles.map((role) => [role.id, role]))
  const lines = activity.lineRefs.flatMap((lineId) => {
    const line = linesById.get(lineId)
    return line ? [line] : []
  })
  const roles = activity.roleRefs.flatMap((roleId) => {
    const role = rolesById.get(roleId)
    return role ? [role] : []
  })

  return (
    <DialogueRolePractice
      completed={state.ready}
      lines={lines}
      onComplete={actions.completeMedia}
      roles={roles}
      step={{
        countdownSeconds: activity.countdownSeconds,
        handoffDelayMs: activity.handoffDelayMs,
        roleIds: activity.roleRefs,
      }}
    />
  )
}
