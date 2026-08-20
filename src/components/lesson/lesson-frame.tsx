'use client'

import { ArrowRightIcon, RotateCcwIcon } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode, useCallback } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { LessonChrome } from '@/components/learning-shell/lesson-chrome'
import { useLessonCompletion } from '@/hooks/lesson/use-lesson-completion'
import { useLessonSession } from '@/hooks/lesson/use-lesson-session'
import { useLessonStep } from '@/hooks/lesson/use-lesson-step'

import { InteractionFeedback } from './interaction-feedback'

export function LessonFrame({ children }: { children: ReactNode }) {
  const session = useLessonSession()
  const { advance, feedback, retry, step } = useLessonStep()
  const { completeNode } = useLearningActions()
  const bridgeCompletion = useCallback(
    (completion: { nodeId: string | null }) => {
      if (completion.nodeId) completeNode(completion.nodeId)
    },
    [completeNode],
  )
  const completion = useLessonCompletion(bridgeCompletion)

  if (!session || !step) return null

  const action = completion ? (
    <Link
      className={buttonVariants({ size: 'learning', variant: 'learning' })}
      href="/learn"
    >
      Return to route
      <ArrowRightIcon data-icon="inline-end" />
    </Link>
  ) : feedback?.kind === 'incorrect' && !step.session.isReady ? (
    <Button onClick={retry} size="learning" variant="learning">
      <RotateCcwIcon data-icon="inline-start" />
      Try again
    </Button>
  ) : (
    <Button
      disabled={!step.session.isReady}
      onClick={advance}
      size="learning"
      variant="learning"
    >
      {step.isLast ? 'Finish lesson' : 'Continue'}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )

  return (
    <LessonChrome
      action={action}
      exitHref="/learn"
      feedback={
        feedback ? <InteractionFeedback feedback={feedback} /> : undefined
      }
      progress={session.progressPercent}
      reserveFeedbackSpace
      title={session.title}
    >
      <div className="flex w-full flex-col gap-7">
        <header className="mx-auto flex w-full max-w-xl flex-col gap-2 text-start">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-8 bg-focus" />
            <p className="text-sm font-semibold text-focus">
              {step.definition.eyebrow ?? `Step ${step.index + 1}`}
            </p>
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-balance sm:text-3xl">
            {step.definition.title}
          </h1>
          <p className="max-w-xl leading-7 text-muted-foreground text-balance">
            {step.definition.instruction}
          </p>
        </header>
        <div className="mx-auto flex w-full max-w-xl justify-center">
          {children}
        </div>
      </div>
    </LessonChrome>
  )
}
