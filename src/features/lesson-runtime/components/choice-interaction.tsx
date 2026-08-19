'use client'

import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

import { useChoiceInteraction } from '../hooks/use-choice-interaction'
import type { ChoiceOption } from '../model/interaction-types'

export function ChoiceInteraction({
  disabled = false,
  options,
  prompt,
  onSubmit,
}: {
  disabled?: boolean
  options: ChoiceOption[]
  prompt: string
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
}) {
  const { selectedId, select, submit } = useChoiceInteraction(options, onSubmit)

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {prompt}
        </FieldLegend>
        <FieldDescription>Choose one answer.</FieldDescription>
      </div>

      <ToggleGroup
        aria-label={prompt}
        className="grid w-full grid-cols-1 gap-3"
        disabled={disabled}
        onValueChange={select}
        size="learning"
        value={selectedId ? [selectedId] : []}
        variant="learning"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.id} value={option.id}>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-semibold text-balance">{option.label}</span>
              {option.description ? (
                <span className="text-xs leading-5 font-normal text-muted-foreground text-balance">
                  {option.description}
                </span>
              ) : null}
            </span>
            <CheckIcon
              aria-hidden="true"
              className="ms-auto opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Button
        className="w-full sm:ms-auto sm:w-auto"
        disabled={disabled || !selectedId}
        onClick={submit}
        size="learning"
        variant="learning"
      >
        Check answer
      </Button>
    </FieldSet>
  )
}
