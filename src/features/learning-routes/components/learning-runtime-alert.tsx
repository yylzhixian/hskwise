'use client'

import { HardDriveIcon } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { useLearningRuntimeStatus } from '@/features/learning-state/hooks/use-learning-runtime-status'

export function LearningRuntimeAlert() {
  const { hydration } = useLearningRuntimeStatus()

  if (hydration.status !== 'degraded') return null

  return (
    <Alert className="border-route-review-border border-s-4 bg-route-review-surface px-5 py-4 text-route-review-foreground">
      <HardDriveIcon className="size-5" />
      <AlertTitle className="text-base font-semibold">
        Progress will not be saved
      </AlertTitle>
      <AlertDescription className="font-medium text-route-review-foreground/80">
        {hydration.diagnostic ??
          'You can keep learning in this session, but progress will be lost when the page closes.'}
      </AlertDescription>
    </Alert>
  )
}
