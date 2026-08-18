'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  CircleX,
  MousePointerClick,
  Send,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SceneInteraction } from '@/features/course-studio/scene-schema/interaction-schema'
import type { MockAsset } from '@/features/course-studio/scene-schema/project-schema'
import type { InteractionAttempt } from '@/features/course-studio/scene-schema/runtime-schema'
import type {
  JsonValue,
  LocalizedText,
} from '@/features/course-studio/scene-schema/shared'
import {
  ClozeInteractionBody,
  DictationInteractionBody,
  MatchingInteractionBody,
  OrderingInteractionBody,
  ShortAnswerInteractionBody,
  SpeechRepeatInteractionBody,
} from './structured-interactions'

type InteractionRendererProps = {
  interaction: SceneInteraction
  locale: string
  attempt?: InteractionAttempt
  assetsById: Map<string, MockAsset>
  onSubmit: (
    interactionId: string,
    isCorrect?: boolean | null,
    answer?: JsonValue,
  ) => void
}

export function InteractionRenderer({
  interaction,
  locale,
  attempt,
  assetsById,
  onSubmit,
}: InteractionRendererProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {interaction.kind}
          </p>
          {interaction.prompt ? (
            <h3 className="text-sm font-semibold leading-snug">
              {readText(interaction.prompt, locale)}
            </h3>
          ) : null}
        </div>
        <InteractionStatus interaction={interaction} attempt={attempt} />
      </div>

      {renderInteractionBody(
        interaction,
        locale,
        attempt,
        assetsById,
        onSubmit,
      )}

      {attempt ? (
        <p
          className={cn(
            'text-xs font-medium',
            attempt.isCorrect === true
              ? 'text-primary'
              : attempt.isCorrect === false
                ? 'text-destructive'
                : 'text-muted-foreground',
          )}
          role="status"
        >
          {getFeedback(interaction, locale, attempt.isCorrect)}
        </p>
      ) : null}
    </section>
  )
}

function renderInteractionBody(
  interaction: SceneInteraction,
  locale: string,
  attempt: InteractionAttempt | undefined,
  assetsById: Map<string, MockAsset>,
  onSubmit: (
    interactionId: string,
    isCorrect?: boolean | null,
    answer?: JsonValue,
  ) => void,
) {
  switch (interaction.kind) {
    case 'multipleChoice':
      return (
        <MultipleChoiceBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          locale={locale}
          attempt={attempt}
          onSubmit={onSubmit}
        />
      )

    case 'matching':
      return (
        <MatchingInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          locale={locale}
          attempt={attempt}
          onSubmit={onSubmit}
        />
      )

    case 'ordering':
      return (
        <OrderingInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          locale={locale}
          attempt={attempt}
          onSubmit={onSubmit}
        />
      )

    case 'cloze':
      return (
        <ClozeInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          locale={locale}
          attempt={attempt}
          onSubmit={onSubmit}
        />
      )

    case 'dictation':
      return (
        <DictationInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          attempt={attempt}
          asset={
            interaction.audioAssetId
              ? assetsById.get(interaction.audioAssetId)
              : undefined
          }
          onSubmit={onSubmit}
        />
      )

    case 'speechRepeat':
      return (
        <SpeechRepeatInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          asset={
            interaction.audioAssetId
              ? assetsById.get(interaction.audioAssetId)
              : undefined
          }
          onSubmit={onSubmit}
        />
      )

    case 'rolePlay':
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {interaction.turns.map((turn) => (
              <div
                key={turn.id}
                className={cn(
                  'rounded-md border border-border bg-background px-3 py-2 text-sm',
                  turn.learnerShouldSpeak ? 'bg-secondary' : '',
                )}
              >
                <p className="font-medium">{turn.speakerKey}</p>
                <p>{turn.text}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => onSubmit(interaction.id, null)}>
            <Users data-icon="inline-start" />
            Complete role play
          </Button>
        </div>
      )

    case 'hotspot':
    case 'dragDrop':
    case 'swipe':
      return (
        <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
          <MousePointerClick data-icon="inline-start" />
          Simulate submit
        </Button>
      )

    case 'shortAnswer':
      return (
        <ShortAnswerInteractionBody
          key={`${interaction.id}:${attempt?.attemptNo ?? 0}`}
          interaction={interaction}
          locale={locale}
          attempt={attempt}
          onSubmit={onSubmit}
        />
      )

    case 'boundedChat':
      return (
        <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
          <MousePointerClick data-icon="inline-start" />
          Simulate submit
        </Button>
      )
  }
}

function MultipleChoiceBody({
  interaction,
  locale,
  attempt,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'multipleChoice' }>
  locale: string
  attempt?: InteractionAttempt
  onSubmit: (
    interactionId: string,
    isCorrect?: boolean | null,
    answer?: JsonValue,
  ) => void
}) {
  const attemptedOptionIds = readAttemptedOptionIds(attempt)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(
    attemptedOptionIds,
  )

  if (!interaction.allowMultiple) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.options.map((option) => {
          const selected = attemptedOptionIds.includes(option.id)
          return (
            <Button
              key={option.id}
              variant={selected ? 'secondary' : 'outline'}
              className="h-auto min-h-10 justify-start whitespace-normal py-2 text-left"
              onClick={() =>
                onSubmit(interaction.id, option.isCorrect, {
                  optionIds: [option.id],
                })
              }
            >
              {selected && attempt ? (
                attempt.isCorrect === true ? (
                  <CheckCircle2 data-icon="inline-start" />
                ) : (
                  <CircleX data-icon="inline-start" />
                )
              ) : null}
              {readText(option.text, locale)}
            </Button>
          )
        })}
      </div>
    )
  }

  const submitSelection = () => {
    const correctOptionIds = interaction.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id)
      .sort()
    const submittedOptionIds = [...selectedOptionIds].sort()
    const isCorrect =
      correctOptionIds.length === submittedOptionIds.length &&
      correctOptionIds.every((optionId, index) => optionId === submittedOptionIds[index])

    onSubmit(interaction.id, isCorrect, { optionIds: submittedOptionIds })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {interaction.options.map((option) => {
          const selected = selectedOptionIds.includes(option.id)
          return (
            <label
              key={option.id}
              className={cn(
                'flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted',
                selected ? 'bg-secondary' : 'bg-background',
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  setSelectedOptionIds((current) =>
                    current.includes(option.id)
                      ? current.filter((optionId) => optionId !== option.id)
                      : [...current, option.id],
                  )
                }
                className="size-4 accent-primary"
              />
              <span>{readText(option.text, locale)}</span>
            </label>
          )
        })}
      </div>
      <Button
        variant="secondary"
        onClick={submitSelection}
        disabled={selectedOptionIds.length === 0}
      >
        <Send data-icon="inline-start" />
        Submit answer
      </Button>
    </div>
  )
}

function InteractionStatus({
  interaction,
  attempt,
}: {
  interaction: SceneInteraction
  attempt?: InteractionAttempt
}) {
  if (!attempt) {
    return <Badge variant="secondary">Pending</Badge>
  }

  if (attempt.isCorrect === null) {
    return (
      <Badge variant="secondary">
        {getUngradedStatusLabel(interaction)}
      </Badge>
    )
  }

  return (
    <Badge variant={attempt.isCorrect ? 'default' : 'destructive'}>
      {attempt.isCorrect ? 'Correct' : `Retry ${attempt.attemptNo}`}
    </Badge>
  )
}

function readAttemptedOptionIds(attempt?: InteractionAttempt) {
  if (!attempt || !attempt.answer || typeof attempt.answer !== 'object') return []
  if (Array.isArray(attempt.answer)) return []
  const optionIds = attempt.answer.optionIds
  return Array.isArray(optionIds)
    ? optionIds.filter((value): value is string => typeof value === 'string')
    : []
}

function getFeedback(
  interaction: SceneInteraction,
  locale: string,
  isCorrect: boolean | null,
) {
  if (isCorrect === null) {
    if (interaction.kind === 'speechRepeat') {
      return interaction.scoringMode === 'automatic'
        ? 'Recording submitted for scoring.'
        : 'Recording saved for review.'
    }
    return 'Response saved.'
  }

  const feedback = isCorrect
    ? interaction.feedback?.correct
    : interaction.feedback?.incorrect ?? interaction.feedback?.retry
  if (feedback) return readText(feedback, locale)
  return isCorrect ? 'Correct.' : 'Try another answer.'
}

function getUngradedStatusLabel(interaction: SceneInteraction) {
  if (interaction.kind === 'speechRepeat') {
    return interaction.scoringMode === 'automatic' ? 'Awaiting score' : 'Recorded'
  }
  return 'Submitted'
}

function readText(value: LocalizedText, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}
