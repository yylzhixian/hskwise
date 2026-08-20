import { XIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import {
  LearningAppearanceRoot,
  LearningAppearanceToggle,
} from './learning-appearance'

type LessonChromeProps = {
  children: ReactNode
  title: string
  progress?: number
  action?: ReactNode
  exitHref?: string
  feedback?: ReactNode
  reserveFeedbackSpace?: boolean
}

export function LessonChrome({
  action,
  children,
  exitHref = '/learn',
  feedback,
  progress = 0,
  reserveFeedbackSpace = false,
  title,
}: LessonChromeProps) {
  return (
    <LearningAppearanceRoot className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 shrink-0 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-4xl grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-3 sm:px-6">
          <Link
            aria-label="Exit lesson"
            className={buttonVariants({ size: 'icon-lg', variant: 'ghost' })}
            href={exitHref}
          >
            <XIcon />
          </Link>

          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
              <span className="truncate">{title}</span>
              <span className="shrink-0 tabular-nums">{progress}%</span>
            </div>
            <Progress aria-label="Lesson progress" value={progress} />
          </div>

          <div className="flex justify-end">
            <LearningAppearanceToggle />
          </div>
        </div>
      </header>

      <main
        className="min-h-0 w-full flex-1 items-center overflow-y-auto overscroll-contain"
        id="lesson-content"
      >
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </div>
      </main>

      <footer className="z-40 shrink-0 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div
          className={cn(
            'mx-auto grid min-h-22 w-full max-w-3xl items-center gap-3 px-4 py-2 sm:px-6',
            reserveFeedbackSpace || feedback
              ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]'
              : 'grid-cols-1'
          )}
        >
          {reserveFeedbackSpace || feedback ? (
            <div aria-live="polite" className="min-w-0">
              {feedback}
            </div>
          ) : null}

          <div className="flex justify-end [&>*]:w-full sm:[&>*]:w-auto">
            {action ?? (
              <Button disabled size="learning" variant="learning">
                Continue
              </Button>
            )}
          </div>
        </div>
      </footer>
    </LearningAppearanceRoot>
  )
}
