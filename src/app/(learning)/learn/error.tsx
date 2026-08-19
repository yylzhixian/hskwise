'use client'

import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-2xl items-center px-4 py-12 sm:px-6 md:min-h-[calc(100dvh-4.0625rem)]">
      <div className="flex w-full flex-col gap-4">
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>We could not open your learning path</AlertTitle>
          <AlertDescription>
            Your progress has not been changed. Try loading the path again.
          </AlertDescription>
        </Alert>
        <Button className="self-start" onClick={reset} variant="outline">
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
      </div>
    </section>
  )
}
