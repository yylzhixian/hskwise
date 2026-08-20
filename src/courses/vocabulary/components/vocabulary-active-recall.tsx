'use client'

import { EyeIcon, RotateCcwIcon, SparklesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useActiveRecall } from '../hooks/use-active-recall'
import type {
  VocabularyItem,
  VocabularyLessonStep,
} from '../model/vocabulary-lesson-schema'

type ActiveRecallStep = Extract<
  VocabularyLessonStep,
  { kind: 'active-recall' }
>

export function VocabularyActiveRecall({
  disabled,
  item,
  onAssess,
  step,
}: {
  disabled: boolean
  item: VocabularyItem
  onAssess: (result: { recalled: boolean }) => void
  step: ActiveRecallStep
}) {
  const { assess, reveal, revealed } = useActiveRecall(onAssess)

  return (
    <section className="w-full border-y py-7 text-center">
      <Badge variant="outline">{revealed ? 'Answer revealed' : 'Answer hidden'}</Badge>
      <p className="mx-auto mt-5 max-w-md text-xl leading-8 font-semibold text-balance">
        {step.cue}
      </p>

      <div className="mt-7 flex min-h-32 flex-col items-center justify-center border-y py-5">
        {revealed ? (
          <>
            <p className="text-5xl leading-none font-semibold">{item.text}</p>
            <p className="mt-3 text-lg font-medium text-focus">{item.pinyin}</p>
            <p className="mt-1 text-muted-foreground">{item.meaning}</p>
          </>
        ) : (
          <p aria-label="Answer concealed" className="text-4xl text-muted-foreground/45">
            • •
          </p>
        )}
      </div>

      {revealed ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            disabled={disabled}
            onClick={() => assess(false)}
            size="learning"
            variant="outline"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Need another look
          </Button>
          <Button
            disabled={disabled}
            onClick={() => assess(true)}
            size="learning"
            variant="learning"
          >
            <SparklesIcon data-icon="inline-start" />
            I recalled it
          </Button>
        </div>
      ) : (
        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={reveal}
          size="learning"
          variant="outline"
        >
          <EyeIcon data-icon="inline-start" />
          {step.revealLabel}
        </Button>
      )}
    </section>
  )
}
