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

import type { VocabularyLessonStep } from '../model/vocabulary-lesson-schema'

type ChoiceStep = Extract<
  VocabularyLessonStep,
  { kind: 'meaning-choice' | 'sentence-application' }
>

export function VocabularyChoice({
  disabled,
  onSubmit,
  step,
}: {
  disabled: boolean
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
  step: ChoiceStep
}) {
  const { select, selectedId, submit } = useChoiceInteraction(
    step.options,
    onSubmit,
  )

  return (
    <FieldSet className="w-full gap-5">
      {step.kind === 'sentence-application' ? (
        <div className="border-y py-6 text-center">
          <p className="text-3xl leading-10 font-semibold">
            {step.sentenceBefore}
            <span className="mx-2 inline-block min-w-16 border-b-2 border-focus text-focus">
              ?
            </span>
            {step.sentenceAfter}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{step.translation}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {step.prompt}
        </FieldLegend>
        <FieldDescription>
          {step.kind === 'meaning-choice'
            ? 'Use the word inside its sentence pattern.'
            : 'Choose the word that makes the sentence complete.'}
        </FieldDescription>
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
