import {
  CheckCircle2Icon,
  InfoIcon,
  RotateCcwIcon,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import type { LessonFeedback } from '@/learning/runtime/model/lesson-session-schema'

export function InteractionFeedback({
  feedback,
}: {
  feedback: LessonFeedback
}) {
  const Icon =
    feedback.kind === 'correct'
      ? CheckCircle2Icon
      : feedback.kind === 'incorrect'
        ? RotateCcwIcon
        : InfoIcon
  const variant =
    feedback.kind === 'correct'
      ? 'success'
      : feedback.kind === 'incorrect'
        ? 'destructive'
        : 'warning'

  return (
    <Alert variant={variant}>
      <Icon />
      <AlertTitle>{feedback.title}</AlertTitle>
      <AlertDescription>{feedback.message}</AlertDescription>
    </Alert>
  )
}
