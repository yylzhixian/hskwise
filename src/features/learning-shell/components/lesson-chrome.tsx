import { XIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type LessonChromeProps = {
  children: ReactNode
  title: string
  progress?: number
  action?: ReactNode
}

export function LessonChrome({
  action,
  children,
  progress = 0,
  title,
}: LessonChromeProps) {
  return (
    <div className="learning-theme flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto grid h-16 w-full max-w-4xl grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 px-3 sm:px-6">
          <Button
            aria-label="Exit lesson"
            nativeButton={false}
            render={<Link href="/learn" />}
            size="icon-lg"
            variant="ghost"
          >
            <XIcon />
          </Button>

          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
              <span className="truncate">{title}</span>
              <span className="shrink-0 tabular-nums">{progress}%</span>
            </div>
            <Progress aria-label="Lesson progress" value={progress} />
          </div>

          <div aria-hidden="true" />
        </div>
      </header>

      <main
        className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-12"
        id="lesson-content"
      >
        {children}
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex min-h-20 w-full max-w-3xl items-center justify-end px-4 py-3 sm:px-6">
          {action ?? (
            <Button disabled size="learning" variant="learning">
              Continue
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
