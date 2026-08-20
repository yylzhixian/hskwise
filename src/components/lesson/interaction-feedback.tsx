import {
  CheckCircle2Icon,
  CircleCheckBigIcon,
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
  const presentation = feedbackPresentations[feedback.kind]
  const Icon = presentation.icon

  return (
    <Alert
      className={presentation.className}
      data-feedback-kind={feedback.kind}
      variant={presentation.variant}
    >
      <Icon className="size-5" />
      <AlertTitle className="flex flex-col gap-0.5">
        <span>{feedback.title}</span>
      </AlertTitle>
      <AlertDescription className={presentation.descriptionClassName}>
        {feedback.message}
      </AlertDescription>
    </Alert>
  )
}

const feedbackPresentations = {
  completion: {
    className:
      'border-route-complete-border bg-route-complete-surface text-route-complete-foreground',
    descriptionClassName: 'text-route-complete-foreground/80',
    icon: CheckCircle2Icon,
    variant: 'default',
  },
  correct: {
    className: '',
    descriptionClassName: 'text-route-complete-foreground/80',
    icon: CircleCheckBigIcon,
    variant: 'success',
  },
  incorrect: {
    className: 'border-destructive/70 bg-destructive/10',
    descriptionClassName: 'text-destructive/90',
    icon: RotateCcwIcon,
    variant: 'destructive',
  },
  info: {
    className: '',
    descriptionClassName: 'text-route-review-foreground/80',
    icon: InfoIcon,
    variant: 'warning',
  },
} as const satisfies Record<
  LessonFeedback['kind'],
  {
    className: string
    descriptionClassName: string
    icon: typeof InfoIcon
    variant: 'default' | 'success' | 'warning' | 'destructive'
  }
>
