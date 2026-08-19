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
    <LearningAppearanceRoot className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
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
        className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-12"
        id="lesson-content"
      >
        {children}
      </main>

      {reserveFeedbackSpace || feedback ? (
        <div
          aria-live="polite"
          className={cn(
            'mx-auto flex min-h-[5.5rem] w-full max-w-3xl items-center px-4 py-3 sm:px-6',
            !feedback && 'invisible',
          )}
        >
          {feedback}
        </div>
      ) : null}

      <footer className="border-t bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-20 w-full max-w-3xl items-center justify-end px-4 py-3 sm:px-6">
          {action ?? (
            <Button disabled size="learning" variant="learning">
              Continue
            </Button>
          )}
        </div>
      </footer>
    </LearningAppearanceRoot>
  )
}
