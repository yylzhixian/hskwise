'use client'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  EyeIcon,
  HistoryIcon,
  LightbulbIcon,
  RotateCcwIcon,
} from 'lucide-react'
import Link from 'next/link'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { formatKebabLabel } from '@/lib/format-kebab-label'
import type { LearningReviewResult } from '@/store/learning/model/review-schedule'

import { useReviewSession } from './hooks/use-review-session'

export function ReviewView() {
  const session = useReviewSession()
  const progress =
    session.initialTotal === 0
      ? 0
      : Math.round((session.processedCount / session.initialTotal) * 100)

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-4xl flex-col px-4 py-7 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <header className="flex flex-col gap-6 border-b pb-6">
        <Button
          className="self-start"
          nativeButton={false}
          render={<Link href="/learn" />}
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Learning path
        </Button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-reward">Memory lane</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Daily review
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Recall the answer before revealing it, then judge your memory
              honestly.
            </p>
          </div>
          <Badge className="rounded-sm" variant="outline">
            {session.dueCount} due now
          </Badge>
        </div>

        {session.initialTotal > 0 ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              Session
            </span>
            <Progress aria-label="Review session progress" value={progress} />
            <span className="text-xs font-semibold tabular-nums">
              {session.processedCount}/{session.initialTotal}
            </span>
          </div>
        ) : null}
      </header>

      {session.activePrompt ? (
        <ReviewPrompt session={session} />
      ) : (
        <ReviewEmpty completed={session.processedCount > 0} />
      )}
    </section>
  )
}

type ReviewSession = ReturnType<typeof useReviewSession>

function ReviewPrompt({ session }: { session: ReviewSession }) {
  const prompt = session.activePrompt

  if (!prompt) return null

  const question = prompt.mistake?.prompt ?? prompt.item.label
  const correction =
    prompt.mistake?.correction ??
    'Return to the source lesson to review this item in context.'

  return (
    <div className="flex flex-1 flex-col py-7 sm:py-10">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-focus">
          {String(session.currentNumber).padStart(2, '0')}
        </span>
        <span aria-hidden="true">/</span>
        <span>{session.initialTotal} in this session</span>
        <span aria-hidden="true">·</span>
        <span>{formatKebabLabel(prompt.item.lessonId)}</span>
        <Badge className="ml-auto rounded-sm" variant="outline">
          Attempt {prompt.item.attemptCount + 1}
        </Badge>
      </div>

      <div className="mt-5 border-y py-10 sm:py-14">
        <p className="text-xs font-semibold text-muted-foreground uppercase">
          Recall before you reveal
        </p>
        <h2 className="mt-4 max-w-3xl text-2xl leading-tight font-semibold text-balance sm:text-4xl">
          {question}
        </h2>

        {!session.isRevealed ? (
          <Button
            className="mt-8 w-full sm:w-auto"
            onClick={session.revealAnswer}
            size="learning"
            variant="learning"
          >
            <EyeIcon data-icon="inline-start" />
            Reveal answer
          </Button>
        ) : (
          <div className="mt-9 border-s-2 border-focus bg-accent/40 px-5 py-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-focus">
              <LightbulbIcon className="size-4" />
              Answer
            </div>
            <p className="mt-3 max-w-2xl text-lg leading-8">{correction}</p>
          </div>
        )}
      </div>

      {session.feedback ? (
        <ReviewFeedback
          continueReview={session.continueReview}
          result={session.feedback}
        />
      ) : session.isRevealed ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={() => session.assess('needs-review')}
            size="learning"
            variant="outline"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Review again
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => session.assess('recalled')}
            size="learning"
            variant="learning"
          >
            <CheckCircle2Icon data-icon="inline-start" />
            I recalled it
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ReviewFeedback({
  continueReview,
  result,
}: {
  continueReview: () => void
  result: LearningReviewResult
}) {
  const needsReview = result === 'needs-review'

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Alert variant={needsReview ? 'warning' : 'success'}>
        {needsReview ? <HistoryIcon /> : <CheckCircle2Icon />}
        <AlertTitle>
          {needsReview ? 'Scheduled for another look' : 'Marked as mastered'}
        </AlertTitle>
        <AlertDescription>
          {needsReview
            ? 'This is useful memory feedback, not a wrong answer. It will return in 10 minutes.'
            : 'This item left the active queue and its linked mistake is now resolved.'}
        </AlertDescription>
      </Alert>
      <Button
        className="w-full self-end sm:w-auto"
        onClick={continueReview}
        size="learning"
        variant="learning"
      >
        Continue
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}

function ReviewEmpty({ completed }: { completed: boolean }) {
  return (
    <Empty className="my-auto min-h-96 rounded-md border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircle2Icon />
        </EmptyMedia>
        <EmptyTitle>
          {completed ? 'Review complete' : 'Nothing due right now'}
        </EmptyTitle>
        <EmptyDescription>
          {completed
            ? 'You cleared every item that was ready in this session.'
            : 'New review items appear after a lesson mistake reaches its due time.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button
          nativeButton={false}
          render={<Link href="/learn" />}
          variant="outline"
        >
          Learning path
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/mistakes" />}
          variant="learning"
        >
          View mistakes
        </Button>
      </EmptyContent>
    </Empty>
  )
}
