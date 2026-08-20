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
import { useChoiceInteraction } from '@/hooks/lesson/use-choice-interaction'

import type { DialogueLessonStep } from '../model/dialogue-lesson-schema'

type ComprehensionChoiceStep = Extract<
  DialogueLessonStep,
  { kind: 'comprehension-choice' }
>

export function DialogueComprehension({
  disabled,
  onSubmit,
  step,
}: {
  disabled: boolean
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
  step: ComprehensionChoiceStep
}) {
  const { select, selectedId, submit } = useChoiceInteraction(
    step.options,
    onSubmit,
  )

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {step.prompt}
        </FieldLegend>
        <FieldDescription>Choose the purpose of the whole exchange.</FieldDescription>
      </div>

      <ToggleGroup
        aria-label={step.prompt}
        className="grid w-full grid-cols-1 gap-3"
        disabled={disabled}
        onValueChange={select}
        size="learning"
        value={selectedId ? [selectedId] : []}
        variant="learning"
      >
        {step.options.map((option) => (
          <ToggleGroupItem
            className="min-h-20 justify-between"
            key={option.id}
            value={option.id}
          >
            <span className="leading-6 text-wrap">{option.label}</span>
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
