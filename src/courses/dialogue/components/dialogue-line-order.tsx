'use client'

import { closestCorners } from '@dnd-kit/collision'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import type {
  DialogueLineView,
  DialogueOrderingView,
  DialogueRoleView,
} from '@/courses/interactions/model/activity-view-models'
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { useOrderingInteraction } from '@/hooks/lesson/use-ordering-interaction'
import { cn } from '@/lib/utils'

export function DialogueLineOrder({
  description = 'Arrange the lines into the order you heard.',
  disabled,
  lines,
  onSubmit,
  roles,
  step,
}: {
  description?: string
  disabled: boolean
  lines: DialogueLineView[]
  onSubmit: (result: { orderedIds: string[]; isCorrect: boolean }) => void
  roles: DialogueRoleView[]
  step: DialogueOrderingView
}) {
  const { orderedIds, reorder, submit } = useOrderingInteraction({
    correctOrder: step.lineIds,
    initialOrder: step.startingOrder,
    onSubmit,
  })
  const linesById = new Map(lines.map((line) => [line.id, line]))
  const rolesById = new Map(roles.map((role) => [role.id, role]))
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const { source } = event.operation
      if (!isSortable(source)) return
      reorder(source.initialIndex, source.index)
    },
    [reorder],
  )

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {step.prompt}
        </FieldLegend>
        <FieldDescription>{description}</FieldDescription>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <ol className="flex flex-col gap-2">
          {orderedIds.map((lineId, index) => {
            const line = linesById.get(lineId)
            if (!line) return null
            const role = rolesById.get(line.speakerId)

            return (
              <SortableDialogueLine
                disabled={disabled}
                index={index}
                key={line.id}
                line={line}
                roleName={role?.name}
              />
            )
          })}
        </ol>
      </DragDropProvider>

      <Button
        className="w-full sm:ms-auto sm:w-auto"
        disabled={disabled}
        onClick={submit}
        size="learning"
        variant="learning"
      >
        Check order
      </Button>
    </FieldSet>
  )
}

function SortableDialogueLine({
  disabled,
  index,
  line,
  roleName,
}: {
  disabled: boolean
  index: number
  line: DialogueLineView
  roleName?: string
}) {
  const { handleRef, isDragSource, isDropTarget, ref } = useSortable({
    collisionDetector: closestCorners,
    disabled,
    id: line.id,
    index,
    transition: {
      duration: 180,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      idle: true,
    },
  })

  return (
    <li
      className={cn(
        'grid min-h-20 grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md border bg-card px-3 py-2 transition-[border-color,background-color,box-shadow,opacity]',
        isDropTarget && 'border-focus bg-accent/55',
        isDragSource &&
          'z-20 border-focus bg-accent/75 opacity-90 shadow-lg',
      )}
      ref={ref}
    >
      <span className="text-center text-sm font-semibold tabular-nums text-focus">
        {index + 1}
      </span>
      <div className="min-w-0">
        {roleName ? (
          <p className="text-xs font-medium text-muted-foreground">
            {roleName}
          </p>
        ) : null}
        <p
          className={cn(
            'text-lg leading-7 font-semibold text-wrap',
            roleName && 'mt-1',
          )}
        >
          {line.tokens.map((token) => token.text).join('')}
        </p>
      </div>
      <Button
        aria-label={`Drag line ${index + 1} to reorder`}
        className="size-10 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        disabled={disabled}
        ref={handleRef}
        size="icon-lg"
        title="Reorder line"
        variant="ghost"
      >
        <GripVerticalIcon />
      </Button>
    </li>
  )
}
