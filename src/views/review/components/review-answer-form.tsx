'use client'

import {
  CheckCircle2Icon,
  CircleHelpIcon,
  SearchCheckIcon,
} from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

import type { ReviewAttempt } from '../hooks/use-review-session'

export function ReviewAnswerForm({
  attempt,
  correction,
  draftAnswer,
  onChange,
  onMarkUnsure,
  onSubmit,
}: {
  attempt: ReviewAttempt | null
  correction: string
  draftAnswer: string
  onChange: (value: string) => void
  onMarkUnsure: () => void
  onSubmit: () => void
}) {
  const hasAnswer = draftAnswer.trim().length > 0
  const hasAttempt = attempt !== null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="mt-8 flex flex-col gap-7">
      {!hasAttempt ? (
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="review-answer">Your answer</FieldLabel>
              <Textarea
                aria-describedby="review-answer-description"
                autoComplete="off"
                id="review-answer"
                name="review-answer"
                onChange={(event) => onChange(event.target.value)}
                placeholder="Type the word, pinyin, sequence, or idea you remember..."
                rows={4}
                value={draftAnswer}
              />
              <FieldDescription id="review-answer-description">
                A short answer is enough. The reference appears after you
                submit.
              </FieldDescription>
            </Field>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={onMarkUnsure}
                size="learning"
                type="button"
                variant="outline"
              >
                <CircleHelpIcon data-icon="inline-start" />
                I don&apos;t know yet
              </Button>
              <Button
                disabled={!hasAnswer}
                size="learning"
                type="submit"
                variant="learning"
              >
                <SearchCheckIcon data-icon="inline-start" />
                Check my answer
              </Button>
            </div>
          </FieldGroup>
        </form>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold text-focus uppercase">
              Compare the key idea
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your response is saved. Use the reference answer to reinforce the
              key idea before continuing.
            </p>
          </div>

          <dl className="grid overflow-hidden rounded-md border bg-border sm:grid-cols-2">
            <div className="bg-background p-5">
              <dt className="text-xs font-semibold text-muted-foreground">
                Your answer
              </dt>
              <dd className="mt-3 text-lg leading-8 whitespace-pre-wrap">
                {attempt.kind === 'unsure' ? 'Not answered yet' : attempt.answer}
              </dd>
            </div>
            <div className="border-t bg-background p-5 sm:border-t-0 sm:border-s">
              <dt className="flex items-center gap-2 text-xs font-semibold text-focus">
                <CheckCircle2Icon className="size-4" />
                Reference answer
              </dt>
              <dd className="mt-3 text-lg leading-8">{correction}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
