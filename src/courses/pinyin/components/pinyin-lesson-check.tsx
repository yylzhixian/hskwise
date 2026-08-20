'use client'

import { CheckCircle2Icon, CheckIcon, RotateCcwIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { cn } from '@/lib/utils'

import { usePinyinLessonCheck } from '../hooks/use-pinyin-lesson-check'
import type {
  PinyinLessonCheckQuestion,
  PinyinLessonStep,
  PinyinTone,
} from '../model/pinyin-lesson-schema'
import { ToneOptionContour } from './tone-contour'

type LessonCheckStep = Extract<PinyinLessonStep, { kind: 'lesson-check' }>

export function PinyinLessonCheck({
  completed,
  onComplete,
  onIncorrect,
  step,
  tones,
}: {
  completed: boolean
  onComplete: (answers: number[]) => void
  onIncorrect: (question: PinyinLessonCheckQuestion) => void
  step: LessonCheckStep
  tones: PinyinTone[]
}) {
  const {
    advance,
    feedback,
    isComplete,
    question,
    questionIndex,
    selectTone,
    selectedToneNumber,
    submit,
  } = usePinyinLessonCheck({
    onComplete,
    onIncorrect,
    questions: step.questions,
  })

  if (completed || isComplete || !question) {
    return (
      <div className="flex w-full flex-col items-center border-y py-10 text-center">
        <CheckCircle2Icon className="size-9 text-route-complete-foreground" />
        <p className="mt-3 text-xl font-semibold">Five connections made</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          You connected all four tone marks with their pitch paths.
        </p>
      </div>
    )
  }

  const availableTones = selectTones(tones, question.optionToneNumbers)
  const answerLocked = feedback?.kind === 'correct'

  return (
    <FieldSet className="w-full gap-5">
      <div className="flex items-center justify-between gap-4">
        <ol
          aria-label={`Question ${questionIndex + 1} of ${step.questions.length}`}
          className="flex flex-1 gap-2"
        >
          {step.questions.map((item, index) => (
            <li
              aria-current={index === questionIndex ? 'step' : undefined}
              className={cn(
                'h-1.5 flex-1 rounded-full bg-muted',
                index < questionIndex && 'bg-route-complete-border',
                index === questionIndex && 'bg-focus',
              )}
              key={item.id}
            />
          ))}
        </ol>
        <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
          {questionIndex + 1} / {step.questions.length}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {question.prompt}
        </FieldLegend>
        <FieldDescription>Choose one pitch path.</FieldDescription>
      </div>

      <ToggleGroup
        aria-label={question.prompt}
        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        disabled={answerLocked}
        onValueChange={selectTone}
        size="learning"
        value={selectedToneNumber ? [`tone-${selectedToneNumber}`] : []}
        variant="learning"
      >
        {availableTones.map((tone) => (
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
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {feedback ? (
        <Alert variant={feedback.kind === 'correct' ? 'success' : 'destructive'}>
          {feedback.kind === 'correct' ? (
            <CheckCircle2Icon />
          ) : (
            <RotateCcwIcon />
          )}
          <AlertTitle>
            {feedback.kind === 'correct' ? 'Connection made' : 'Try this one again'}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full sm:ms-auto sm:w-auto"
        disabled={!selectedToneNumber}
        onClick={answerLocked ? advance : submit}
        size="learning"
        variant="learning"
      >
        {answerLocked
          ? questionIndex === step.questions.length - 1
            ? 'Finish check'
            : 'Next question'
          : 'Check answer'}
      </Button>
    </FieldSet>
  )
}

function selectTones(
  tones: PinyinTone[],
  toneNumbers: Array<PinyinTone['number']>,
) {
  const tonesByNumber = new Map(tones.map((tone) => [tone.number, tone]))
  return toneNumbers.flatMap((toneNumber) => {
    const tone = tonesByNumber.get(toneNumber)
    return tone ? [tone] : []
  })
}
