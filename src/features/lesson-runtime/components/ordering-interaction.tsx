'use client'

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useOrderingInteraction } from '../hooks/use-ordering-interaction'
import type { OrderingItem } from '../model/interaction-types'

export function OrderingInteraction({
  disabled = false,
  items,
  prompt,
  onSubmit,
}: {
  disabled?: boolean
  items: OrderingItem[]
  prompt: string
  onSubmit: (result: { itemIds: string[]; isCorrect: boolean }) => void
}) {
  const { itemIds, move, submit } = useOrderingInteraction(items, onSubmit)
  const itemsById = new Map(items.map((item) => [item.id, item]))

  return (
    <section aria-labelledby="ordering-prompt" className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-balance" id="ordering-prompt">
          {prompt}
        </h2>
        <p className="text-sm text-muted-foreground">
          Move each item until the sequence feels right.
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {itemIds.map((itemId, index) => {
          const item = itemsById.get(itemId)
          if (!item) return null

          return (
            <li
              className="grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md border bg-card px-3 py-2"
              key={item.id}
            >
              <span className="text-center text-sm font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 font-medium">{item.label}</span>
              <span className="flex items-center gap-1">
                <Button
                  aria-label={`Move ${item.label} up`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  size="icon-lg"
                  title="Move up"
                  variant="ghost"
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  aria-label={`Move ${item.label} down`}
                  disabled={disabled || index === itemIds.length - 1}
                  onClick={() => move(index, 1)}
                  size="icon-lg"
                  title="Move down"
                  variant="ghost"
                >
                  <ArrowDownIcon />
                </Button>
              </span>
            </li>
          )
        })}
      </ol>

      <Button
        className="w-full sm:ms-auto sm:w-auto"
        disabled={disabled}
        onClick={submit}
        size="learning"
        variant="learning"
      >
        Check order
      </Button>
    </section>
  )
}
