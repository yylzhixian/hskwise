'use client'

import { ArrowLeftIcon, Clock3Icon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/components/ui/progress'
import { useLearningProgress } from '@/features/learning-state/hooks/use-learning-progress'
import { useLearningScenario } from '@/features/learning-state/hooks/use-learning-scenario'

import { LearningRuntimeAlert } from './learning-runtime-alert'
import { RouteMap } from './route-map'

export function RouteDetail() {
  const progress = useLearningProgress()
  const { withFixture } = useLearningScenario()
  const stage = progress.route.stages[0]

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-5xl flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <LearningRuntimeAlert />

      <header className="flex flex-col gap-5">
        <Button
          className="self-start"
          nativeButton={false}
          render={<Link href={withFixture('/learn')} />}
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Learn
        </Button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-progress">
              {progress.route.level}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
              {stage.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {stage.description}
            </p>
          </div>
          <Badge className="rounded-md" variant="outline">
            {progress.progressPercent}% complete
          </Badge>
        </div>
      </header>

      <Progress value={progress.progressPercent}>
        <ProgressLabel>{progress.route.title}</ProgressLabel>
        <ProgressValue>
          {() => `${progress.completedCount} of ${progress.nodeViews.length}`}
        </ProgressValue>
      </Progress>

      <RouteMap
        nodeViews={progress.nodeViews}
        progressPercent={progress.progressPercent}
      />

      <section aria-labelledby="route-steps-title" className="border-t pt-7">
        <h2 className="text-lg font-semibold" id="route-steps-title">
          Route steps
        </h2>
        <ol className="mt-4 divide-y border-y">
          {progress.nodeViews.map(({ node, status }) => (
            <li
              className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
              key={node.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{node.title}</h3>
                  <Badge className="rounded-md" variant="outline">
                    {status}
                  </Badge>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {node.description}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3Icon className="size-3.5" />
                {node.estimatedMinutes} min
              </span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  )
}
