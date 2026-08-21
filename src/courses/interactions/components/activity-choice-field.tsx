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
import { useActivityChoice } from '@/hooks/lesson/use-activity-choice'

export function ActivityChoiceField({
  answer,
  description,
  disabled,
  onSubmit,
  options,
  prompt,
}: {
  answer: string
  description: string
  disabled: boolean
  onSubmit: (result: { answer: string; isCorrect: boolean }) => void
  options: Array<{ id: string; label: string; supportingText?: string }>
  prompt: string
}) {
  const { select, selectedId, submit } = useActivityChoice({
    answer,
    onSubmit,
  })

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {prompt}
        </FieldLegend>
        <FieldDescription>{description}</FieldDescription>
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
          <ToggleGroupItem
            className="min-h-18 justify-between"
            key={option.id}
            value={option.id}
          >
            <span className="flex min-w-0 flex-col items-start">
              <span className="leading-6 text-wrap">{option.label}</span>
              {option.supportingText ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {option.supportingText}
                </span>
              ) : null}
            </span>
            <CheckIcon className="opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100" />
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
