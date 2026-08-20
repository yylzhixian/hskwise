'use client'

import { closestCorners } from '@dnd-kit/collision'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { GripVerticalIcon } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { useOrderingInteraction } from '@/hooks/lesson/use-ordering-interaction'
import { cn } from '@/lib/utils'

import type { CheckpointStep } from '../model/checkpoint-schema'

type OrderStep = Extract<CheckpointStep, { kind: 'line-order' }>

export function CheckpointLineOrder({
  disabled,
  onSubmit,
  step,
}: {
  disabled: boolean
  onSubmit: (result: { orderedIds: string[]; isCorrect: boolean }) => void
  step: OrderStep
}) {
  const { orderedIds, reorder, submit } = useOrderingInteraction({
    correctOrder: step.correctOrder,
    initialOrder: step.startingOrder,
    onSubmit,
  })
  const itemsById = new Map(step.items.map((item) => [item.id, item]))
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
        <FieldDescription>Drag each moment into its natural position.</FieldDescription>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <ol className="flex flex-col gap-2">
          {orderedIds.map((itemId, index) => {
            const item = itemsById.get(itemId)
            return item ? (
              <SortableCheckpointItem
                disabled={disabled}
                index={index}
                item={item}
                key={item.id}
              />
            ) : null
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

function SortableCheckpointItem({
  disabled,
  index,
  item,
}: {
  disabled: boolean
  index: number
  item: OrderStep['items'][number]
}) {
  const { handleRef, isDragSource, isDropTarget, ref } = useSortable({
    collisionDetector: closestCorners,
    disabled,
    id: item.id,
    index,
    transition: { duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', idle: true },
  })

  return (
    <li
      className={cn(
        'grid min-h-20 grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md border bg-card px-3 py-2 transition-[border-color,background-color,box-shadow,opacity]',
        isDropTarget && 'border-focus bg-accent/55',
        isDragSource && 'z-20 border-focus bg-accent/75 opacity-90 shadow-lg',
      )}
      ref={ref}
    >
      <span className="text-center text-sm font-semibold tabular-nums text-focus">{index + 1}</span>
      <div className="min-w-0">
        <p className="text-lg leading-7 font-semibold text-wrap">{item.label}</p>
        {item.supportingText ? (
          <p className="mt-1 text-xs text-muted-foreground">{item.supportingText}</p>
        ) : null}
      </div>
      <Button
        aria-label={`Drag item ${index + 1} to reorder`}
        className="size-10 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        disabled={disabled}
        ref={handleRef}
        size="icon-lg"
        title="Reorder item"
        variant="ghost"
      >
        <GripVerticalIcon />
      </Button>
    </li>
  )
}
