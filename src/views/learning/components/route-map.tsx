'use client'

import {
  CheckIcon,
  FlagIcon,
  LockIcon,
  PlayIcon,
  RotateCcwIcon,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { useLearningActions } from '@/hooks/learning/use-learning-actions'
import { cn } from '@/lib/utils'

import type { RouteNodeView } from '@/learning/routes/model/route-progress'

type RouteMapProps = {
  nodeViews: RouteNodeView[]
  progressPercent: number
}

const nodePositions = [
  'left-[24.06%] top-[8.87%] sm:left-[10%] sm:top-[63.33%]',
  'left-[74.06%] top-[34.19%] sm:left-[36.11%] sm:top-[20%]',
  'left-[27.19%] top-[58.39%] sm:left-[63.89%] sm:top-[70%]',
  'left-[71.88%] top-[84.68%] sm:left-[90%] sm:top-[25.33%]',
]

const statusLabels = {
  completed: 'Complete',
  current: 'Current',
  locked: 'Locked',
  review: 'Review',
} as const

const nodeStatusClasses = {
  completed:
    'border-route-complete-border bg-route-complete-surface text-route-complete-foreground',
  current:
    'border-focus bg-accent text-focus ring-4 ring-focus/10 group-hover:scale-[1.03]',
  review:
    'border-route-review-border bg-route-review-surface text-route-review-foreground group-hover:scale-[1.03]',
  locked: 'border-border bg-card text-muted-foreground',
} satisfies Record<RouteNodeView['status'], string>

const nodeBadgeClasses = {
  completed:
    'border-route-complete-border bg-route-complete-surface text-route-complete-foreground',
  current: 'border-focus/50 bg-accent text-accent-foreground',
  review:
    'border-route-review-border bg-route-review-surface text-route-review-foreground',
  locked: 'border-border bg-background text-muted-foreground',
} satisfies Record<RouteNodeView['status'], string>

export function RouteMap({ nodeViews, progressPercent }: RouteMapProps) {
  const { startStarterRoute } = useLearningActions()

  return (
    <div className="relative mx-auto h-[42.5rem] w-full max-w-[22rem] sm:h-auto sm:max-w-3xl sm:aspect-[720/300]">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full sm:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 320 620"
      >
        <RouteConnector
          d="M77 55 C255 95 252 180 237 212 C220 250 87 278 87 362 C87 440 232 454 230 525"
          progressPercent={progressPercent}
        />
      </svg>
      <svg
        aria-hidden="true"
        className="absolute inset-0 hidden size-full sm:block"
        preserveAspectRatio="none"
        viewBox="0 0 720 300"
      >
        <RouteConnector
          d="M72 190 C145 190 180 45 260 60 C350 76 376 235 460 210 C535 188 575 70 648 76"
          progressPercent={progressPercent}
        />
      </svg>

      <ol className="absolute inset-0 list-none">
        {nodeViews.map((view, index) => {
          const { node, status } = view
          const isInteractive = status !== 'locked'
          const href = `/lessons/${node.lessonId}${status === 'review' ? '?mode=review' : ''}`
          const content = (
            <>
              <span
                className={cn(
                  'flex size-16 items-center justify-center rounded-full border-2 transition-transform sm:size-18',
                  nodeStatusClasses[status],
                  view.isCheckpoint &&
                    status !== 'locked' &&
                    'ring-4 ring-reward/25',
                  view.isCheckpoint && status === 'locked' && 'border-reward/60',
                )}
              >
                <NodeIcon isCheckpoint={view.isCheckpoint} status={status} />
              </span>
              <span className="flex w-36 flex-col items-center gap-1 text-center">
                <span className="text-sm leading-5 font-semibold text-balance">
                  {node.shortTitle}
                </span>
                <Badge
                  className={cn(
                    'rounded-sm px-1.5 py-0 text-[0.6875rem]',
                    nodeBadgeClasses[status],
                  )}
                  variant="outline"
                >
                  {view.isCheckpoint ? 'Checkpoint · ' : ''}
                  {statusLabels[status]}
                </Badge>
              </span>
            </>
          )

          return (
            <li
              className={cn(
                'absolute flex -translate-x-1/2 -translate-y-8 flex-col items-center gap-2 sm:-translate-y-9',
                nodePositions[index],
              )}
              key={node.id}
            >
              {isInteractive ? (
                <Link
                  aria-label={`${node.title}, ${statusLabels[status]}`}
                  className="group flex flex-col items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  href={href}
                  onClick={() => startStarterRoute()}
                >
                  {content}
                </Link>
              ) : (
                <div
                  aria-label={`${node.title}, locked`}
                  className="flex flex-col items-center gap-2"
                >
                  {content}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function RouteConnector({
  d,
  progressPercent,
}: {
  d: string
  progressPercent: number
}) {
  return (
    <>
      <path
        d={d}
        fill="none"
        pathLength="100"
        stroke="var(--border)"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        d={d}
        fill="none"
        pathLength="100"
        stroke="var(--progress)"
        strokeDasharray={`${progressPercent} 100`}
        strokeLinecap="round"
        strokeWidth="5"
      />
    </>
  )
}

function NodeIcon({
  isCheckpoint,
  status,
}: {
  isCheckpoint: boolean
  status: RouteNodeView['status']
}) {
  const iconClassName = 'size-7 sm:size-8'

  if (status === 'completed') return <CheckIcon className={iconClassName} />
  if (status === 'locked') return <LockIcon className={iconClassName} />
  if (status === 'review') return <RotateCcwIcon className={iconClassName} />
  if (isCheckpoint) return <FlagIcon className={iconClassName} />
  return <PlayIcon className={iconClassName} />
}
