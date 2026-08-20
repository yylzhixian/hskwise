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

import type { PinyinTone } from '../model/pinyin-lesson-schema'
import { ToneOptionContour } from './tone-contour'

export function ToneChoiceInteraction({
  correctToneNumber,
  disabled,
  onSubmit,
  prompt,
  tones,
}: {
  correctToneNumber: number
  disabled: boolean
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
  prompt: string
  tones: PinyinTone[]
}) {
  const options = tones.map((tone) => ({
    id: `tone-${tone.number}`,
    label: tone.name,
    isCorrect: tone.number === correctToneNumber,
  }))
  const { select, selectedId, submit } = useChoiceInteraction(options, onSubmit)

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {prompt}
        </FieldLegend>
        <FieldDescription>Choose one pitch path.</FieldDescription>
      </div>

      <ToggleGroup
        aria-label={prompt}
        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        disabled={disabled}
        onValueChange={select}
        size="learning"
        value={selectedId ? [selectedId] : []}
        variant="learning"
      >
        {tones.map((tone) => (
          <ToggleGroupItem
            className="min-h-44 flex-col items-stretch gap-2"
            key={tone.number}
            value={`tone-${tone.number}`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-semibold">Tone {tone.number}</span>
              <CheckIcon className="opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100" />
            </span>
            <ToneOptionContour tone={tone} />
            <span className="text-xs font-normal text-muted-foreground">
              {tone.example}
            </span>
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
