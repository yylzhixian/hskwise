'use client'

import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  Clock3Icon,
  MapIcon,
  RotateCcwIcon,
  SparklesIcon,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useLearningActions } from '@/features/learning-state/hooks/use-learning-actions'
import { useLearningProgress } from '@/features/learning-state/hooks/use-learning-progress'
import { useLearningScenario } from '@/features/learning-state/hooks/use-learning-scenario'
import { useMistakeBook } from '@/features/learning-state/hooks/use-mistake-book'
import { useReviewQueue } from '@/features/learning-state/hooks/use-review-queue'

import { LearningRuntimeAlert } from './learning-runtime-alert'
import { RouteMap } from './route-map'

export function LearningHome() {
  const progress = useLearningProgress()
  const reviews = useReviewQueue()
  const mistakes = useMistakeBook()
  const { startStarterRoute } = useLearningActions()
  const { withFixture } = useLearningScenario()
  const continueTarget = progress.continueTarget

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-6xl flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <LearningRuntimeAlert />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold text-focus">Your learning path</p>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            {progress.route.title}
          </h1>
        </div>
        <Badge className="rounded-md" variant="outline">
          {progress.progressPercent}% complete
        </Badge>
      </header>

      <div className="grid gap-5 rounded-lg border bg-card px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-focus">
            {continueTarget.kind === 'review' ? (
              <RotateCcwIcon className="size-4" />
            ) : (
              <SparklesIcon className="size-4" />
            )}
            Continue
          </div>
          <h2 className="text-xl font-semibold text-balance">
            {continueTarget.label}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {continueTarget.description}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          nativeButton={false}
          onClick={() => {
            if (continueTarget.kind === 'start') startStarterRoute()
          }}
          render={<Link href={withFixture(continueTarget.href)} />}
          size="learning"
          variant="learning"
        >
          {continueTarget.kind === 'review' ? 'Open review' : 'Continue'}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-progress">
                  {progress.route.stages[0].title}
                </p>
                <h2 className="mt-1 text-xl font-semibold">Route map</h2>
              </div>
              <Button
                nativeButton={false}
                render={
                  <Link href={withFixture(`/learn/routes/${progress.route.id}`)} />
                }
                variant="ghost"
              >
                Details
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {progress.route.stages[0].description}
            </p>
          </div>

          <div className="mt-4 border-y py-3">
            <Progress value={progress.progressPercent}>
              <ProgressLabel>Starter foundations</ProgressLabel>
              <ProgressValue>
                {() =>
                  `${progress.completedCount} of ${progress.nodeViews.length}`
                }
              </ProgressValue>
            </Progress>
          </div>

          <RouteMap
            nodeViews={progress.nodeViews}
            progressPercent={progress.progressPercent}
          />

          <section
            className="scroll-mt-24 border-t pt-6"
            id="review-due"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-reward-foreground">
                  Today
                </p>
                <h2 className="mt-1 text-lg font-semibold">Review queue</h2>
              </div>
              <Badge className="rounded-md" variant="outline">
                {reviews.dueCount} due
              </Badge>
            </div>
            {reviews.dueItems.length > 0 ? (
              <ul className="mt-4 divide-y border-y">
                {reviews.dueItems.map((item) => (
                  <li
                    className="flex items-center justify-between gap-4 py-3"
                    key={item.id}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Attempt {item.attemptCount + 1}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Nothing is due today. Keep moving along the route.
              </p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <section aria-labelledby="today-summary-title">
            <div className="flex items-center gap-2">
              <Clock3Icon className="size-4 text-focus" />
              <h2 className="font-semibold" id="today-summary-title">
                Today
              </h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1">
              <SummaryStat label="Review due" value={reviews.dueCount} />
              <SummaryStat label="To revisit" value={mistakes.count} />
            </dl>
          </section>

          <Separator />

          <section aria-labelledby="recent-progress-title">
            <div className="flex items-center gap-2">
              <BookOpenCheckIcon className="size-4 text-progress" />
              <h2 className="font-semibold" id="recent-progress-title">
                Recent progress
              </h2>
            </div>
            {progress.recentActivity.length > 0 ? (
              <ol className="mt-4 flex flex-col gap-4">
                {progress.recentActivity.slice(0, 3).map((activity) => (
                  <li className="flex gap-3 text-sm" key={activity.id}>
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-progress text-progress-foreground">
                      <BookOpenCheckIcon className="size-3" />
                    </span>
                    <span className="leading-5">{activity.label}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 flex gap-3 text-sm text-muted-foreground">
                <MapIcon className="mt-0.5 size-4 shrink-0" />
                <p className="leading-5">
                  Your completed lessons will appear here.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
