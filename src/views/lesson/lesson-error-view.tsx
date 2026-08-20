'use client'

import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LessonChrome } from '@/components/learning-shell/lesson-chrome'

export function LessonErrorView({ reset }: { reset: () => void }) {
  return (
    <LessonChrome
      action={
        <Button onClick={reset} size="learning" variant="learning">
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
      }
      title="Lesson unavailable"
    >
      <Alert className="mx-auto max-w-lg" variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>We could not open this lesson</AlertTitle>
        <AlertDescription>
          Your learning progress has not been changed. Try loading the lesson
          again.
        </AlertDescription>
      </Alert>
    </LessonChrome>
  )
}
