'use client'

import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Headphones,
  LoaderCircle,
  Mic,
  RotateCcw,
  Send,
  Square,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SceneInteraction } from '../scene-schema/interaction-schema'
import type { MockAsset } from '../scene-schema/project-schema'
import type { InteractionAttempt } from '../scene-schema/runtime-schema'
import type { JsonValue, LocalizedText } from '../scene-schema/shared'
import {
  evaluateClozeAnswer,
  evaluateDictationAnswer,
  evaluateMatchingAnswer,
  evaluateOrderingAnswer,
  evaluateShortAnswer,
  isAcceptedText,
  meetsShortAnswerMinLength,
  type ClozeAnswer,
  type DictationAnswer,
  type MatchingAnswer,
  type OrderingAnswer,
  type ShortAnswerAnswer,
} from './interaction-answer'
import { useVoiceRecorder } from './use-voice-recorder'

type SubmitInteraction = (
  interactionId: string,
  isCorrect?: boolean | null,
  answer?: JsonValue,
) => void

export function MatchingInteractionBody({
  interaction,
  locale,
  attempt,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'matching' }>
  locale: string
  attempt?: InteractionAttempt
  onSubmit: SubmitInteraction
}) {
  const [matches, setMatches] = useState<Record<string, string>>(() =>
    readMatchingAnswer(attempt),
  )
  const targetOptions = rotate(interaction.pairs)
  const answer: MatchingAnswer = {
    matches: interaction.pairs.flatMap((pair) =>
      matches[pair.id]
        ? [{ sourcePairId: pair.id, targetPairId: matches[pair.id] }]
        : [],
    ),
  }

  return (
    <FieldSet className="gap-3">
      <FieldLegend className="sr-only">Match each item</FieldLegend>
      <FieldGroup className="gap-3">
        {interaction.pairs.map((pair, index) => {
          const fieldId = `${interaction.id}-${pair.id}`
          return (
            <Field key={pair.id} orientation="responsive">
              <FieldLabel htmlFor={fieldId} className="min-w-28">
                <span className="text-muted-foreground">{index + 1}.</span>
                {readText(pair.source, locale)}
              </FieldLabel>
              <Select
                items={targetOptions.map((target) => ({
                  label: readText(target.target, locale),
                  value: target.id,
                }))}
                value={matches[pair.id] ?? ''}
                onValueChange={(targetPairId) =>
                  targetPairId &&
                  setMatches((current) => ({
                    ...current,
                    [pair.id]: targetPairId,
                  }))
                }
              >
                <SelectTrigger id={fieldId} className="w-full sm:max-w-64">
                  <SelectValue placeholder="Choose a match" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {targetOptions.map((target) => (
                      <SelectItem
                        key={target.id}
                        value={target.id}
                      >
                        {readText(target.target, locale)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )
        })}
      </FieldGroup>
      <Button
        variant="secondary"
        onClick={() =>
          onSubmit(
            interaction.id,
            evaluateMatchingAnswer(interaction, answer),
            answer,
          )
        }
        disabled={answer.matches.length !== interaction.pairs.length}
      >
        <Send data-icon="inline-start" />
        Check matches
      </Button>
    </FieldSet>
  )
}

export function OrderingInteractionBody({
  interaction,
  locale,
  attempt,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'ordering' }>
  locale: string
  attempt?: InteractionAttempt
  onSubmit: SubmitInteraction
}) {
  const [itemIds, setItemIds] = useState(() =>
    readOrderingAnswer(interaction, attempt),
  )
  const itemsById = new Map(interaction.items.map((item) => [item.id, item]))
  const answer: OrderingAnswer = { itemIds }

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= itemIds.length) return
    setItemIds((current) => {
      const next = [...current]
      const [itemId] = next.splice(index, 1)
      next.splice(targetIndex, 0, itemId)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {itemIds.map((itemId, index) => {
          const item = itemsById.get(itemId)
          if (!item) return null
          return (
            <li
              key={item.id}
              className="grid min-h-11 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5"
            >
              <span className="text-center text-sm font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 text-sm">
                {readText(item.text, locale)}
              </span>
              <span className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${readText(item.text, locale)} up`}
                  title="Move up"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${readText(item.text, locale)} down`}
                  title="Move down"
                  disabled={index === itemIds.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  <ArrowDown />
                </Button>
              </span>
            </li>
          )
        })}
      </ol>
      <Button
        variant="secondary"
        onClick={() =>
          onSubmit(
            interaction.id,
            evaluateOrderingAnswer(interaction, answer),
            answer,
          )
        }
      >
        <Send data-icon="inline-start" />
        Check order
      </Button>
    </div>
  )
}

export function ClozeInteractionBody({
  interaction,
  locale,
  attempt,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'cloze' }>
  locale: string
  attempt?: InteractionAttempt
  onSubmit: SubmitInteraction
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    readClozeAnswer(attempt),
  )
  const answer: ClozeAnswer = { values }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed">
        {readText(interaction.text, locale)}
      </p>
      <FieldGroup className="gap-3">
        {interaction.blanks.map((blank, index) => {
          const inputId = `${interaction.id}-${blank.id}`
          const value = values[blank.id] ?? ''
          const invalid = Boolean(
            attempt && !isAcceptedText(value, blank.acceptedAnswers),
          )
          return (
            <Field key={blank.id} data-invalid={invalid}>
              <FieldLabel htmlFor={inputId}>Blank {index + 1}</FieldLabel>
              <Input
                id={inputId}
                value={value}
                aria-invalid={invalid}
                autoComplete="off"
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [blank.id]: event.target.value,
                  }))
                }
              />
              {blank.hint ? (
                <FieldDescription>{readText(blank.hint, locale)}</FieldDescription>
              ) : null}
            </Field>
          )
        })}
      </FieldGroup>
      <Button
        variant="secondary"
        disabled={interaction.blanks.some((blank) => !values[blank.id]?.trim())}
        onClick={() =>
          onSubmit(
            interaction.id,
            evaluateClozeAnswer(interaction, answer),
            answer,
          )
        }
      >
        <Send data-icon="inline-start" />
        Check answers
      </Button>
    </div>
  )
}

export function DictationInteractionBody({
  interaction,
  attempt,
  asset,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'dictation' }>
  attempt?: InteractionAttempt
  asset?: MockAsset
  onSubmit: SubmitInteraction
}) {
  const [text, setText] = useState(() => readDictationAnswer(attempt))
  const answer: DictationAnswer = { text }
  const invalid = Boolean(
    attempt && !evaluateDictationAnswer(interaction, answer),
  )

  return (
    <div className="flex flex-col gap-3">
      {asset?.url ? (
        <audio
          className="h-10 w-full"
          controls
          controlsList="nodownload"
          preload="none"
          src={asset.url}
          aria-label="Dictation audio"
        />
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <Headphones className="size-4" aria-hidden="true" />
          Audio is not available in this draft.
        </div>
      )}
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={`${interaction.id}-answer`}>What did you hear?</FieldLabel>
        <Input
          id={`${interaction.id}-answer`}
          value={text}
          aria-invalid={invalid}
          autoComplete="off"
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <Button
        variant="secondary"
        disabled={!text.trim()}
        onClick={() =>
          onSubmit(
            interaction.id,
            evaluateDictationAnswer(interaction, answer),
            answer,
          )
        }
      >
        <Send data-icon="inline-start" />
        Check dictation
      </Button>
    </div>
  )
}

export function ShortAnswerInteractionBody({
  interaction,
  locale,
  attempt,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'shortAnswer' }>
  locale: string
  attempt?: InteractionAttempt
  onSubmit: SubmitInteraction
}) {
  const [text, setText] = useState(() => readShortAnswer(attempt))
  const answer: ShortAnswerAnswer = { text }
  const meetsMinLength = meetsShortAnswerMinLength(interaction, answer)
  const invalid = Boolean(attempt && attempt.isCorrect === false)
  const sampleAnswer = interaction.sampleAnswers[0]

  return (
    <div className="flex flex-col gap-3">
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={`${interaction.id}-answer`}>Your response</FieldLabel>
        <Textarea
          id={`${interaction.id}-answer`}
          value={text}
          aria-invalid={invalid}
          placeholder="Type your response"
          onChange={(event) => setText(event.target.value)}
        />
        <FieldDescription>
          {interaction.minLength
            ? `At least ${interaction.minLength} characters.`
            : 'Write a concise response.'}
        </FieldDescription>
      </Field>
      {attempt && interaction.expectedAnswerKind === 'sample' && sampleAnswer ? (
        <p className="text-sm text-muted-foreground">
          Example response: {readText(sampleAnswer, locale)}
        </p>
      ) : null}
      <Button
        variant="secondary"
        disabled={!meetsMinLength}
        onClick={() =>
          onSubmit(
            interaction.id,
            evaluateShortAnswer(interaction, answer),
            answer,
          )
        }
      >
        <Send data-icon="inline-start" />
        {interaction.expectedAnswerKind === 'exact'
          ? 'Check response'
          : 'Submit response'}
      </Button>
    </div>
  )
}

export function SpeechRepeatInteractionBody({
  interaction,
  asset,
  onSubmit,
}: {
  interaction: Extract<SceneInteraction, { kind: 'speechRepeat' }>
  asset?: MockAsset
  onSubmit: SubmitInteraction
}) {
  const {
    status,
    recording,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()
  const isBusy = status === 'requesting' || status === 'recording'
  const canSubmit = Boolean(recording) || !interaction.recordingRequired

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-lg font-semibold">{interaction.text}</p>
        {interaction.pinyin ? (
          <p className="text-sm text-muted-foreground">{interaction.pinyin}</p>
        ) : null}
      </div>

      {asset?.url ? (
        <audio
          className="h-10 w-full"
          controls
          controlsList="nodownload"
          preload="none"
          src={asset.url}
          aria-label="Reference pronunciation"
        />
      ) : null}

      <div className="flex min-h-8 flex-wrap items-center gap-2" role="status">
        <Badge variant={getRecorderBadgeVariant(status)}>
          {getRecorderStatusLabel(status, recording?.durationMs)}
        </Badge>
        {!asset?.url ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Headphones className="size-3.5" aria-hidden="true" />
            Reference audio unavailable.
          </span>
        ) : null}
        {status === 'denied' ? (
          <span className="text-xs text-destructive">
            Microphone permission was denied. Allow access and try again.
          </span>
        ) : null}
        {status === 'unsupported' ? (
          <span className="text-xs text-destructive">
            Audio recording is not supported in this browser.
          </span>
        ) : null}
        {status === 'error' ? (
          <span className="text-xs text-destructive">
            Recording failed. Check the microphone and try again.
          </span>
        ) : null}
      </div>

      {recording ? (
        <audio
          className="h-10 w-full"
          controls
          src={recording.url}
          aria-label="Your recording"
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === 'recording' ? (
          <Button variant="destructive" onClick={stopRecording}>
            <Square data-icon="inline-start" />
            Stop recording
          </Button>
        ) : recording ? (
          <Button variant="outline" onClick={resetRecording}>
            <RotateCcw data-icon="inline-start" />
            Record again
          </Button>
        ) : (
          <Button variant="secondary" disabled={isBusy} onClick={startRecording}>
            {status === 'requesting' ? (
              <LoaderCircle className="animate-spin" data-icon="inline-start" />
            ) : (
              <Mic data-icon="inline-start" />
            )}
            {status === 'requesting' ? 'Requesting microphone' : 'Start recording'}
          </Button>
        )}

        <Button
          disabled={!canSubmit || isBusy}
          onClick={() =>
            onSubmit(interaction.id, null, {
              recording: recording
                ? {
                    durationMs: recording.durationMs,
                    mimeType: recording.mimeType,
                    sizeBytes: recording.sizeBytes,
                  }
                : null,
              scoreStatus:
                interaction.scoringMode === 'automatic' ? 'pending' : 'notScored',
              scoringMode: interaction.scoringMode,
            })
          }
        >
          <Send data-icon="inline-start" />
          Submit recording
        </Button>
      </div>
    </div>
  )
}

function getRecorderBadgeVariant(status: ReturnType<typeof useVoiceRecorder>['status']) {
  if (status === 'denied' || status === 'unsupported' || status === 'error') {
    return 'destructive' as const
  }
  return status === 'recorded' ? ('default' as const) : ('secondary' as const)
}

function getRecorderStatusLabel(
  status: ReturnType<typeof useVoiceRecorder>['status'],
  durationMs?: number,
) {
  switch (status) {
    case 'requesting':
      return 'Requesting access'
    case 'recording':
      return 'Recording'
    case 'recorded':
      return `Ready - ${formatDuration(durationMs ?? 0)}`
    case 'unsupported':
      return 'Unsupported'
    case 'denied':
      return 'Permission denied'
    case 'error':
      return 'Recording error'
    case 'idle':
      return 'Ready to record'
  }
}

function formatDuration(durationMs: number) {
  return `${Math.max(1, Math.round(durationMs / 1000))}s`
}

function readMatchingAnswer(attempt?: InteractionAttempt) {
  const answer = asRecord(attempt?.answer)
  const matches = answer?.matches
  if (!Array.isArray(matches)) return {}
  return Object.fromEntries(
    matches.flatMap((match) => {
      const value = asRecord(match)
      return typeof value?.sourcePairId === 'string' &&
        typeof value.targetPairId === 'string'
        ? [[value.sourcePairId, value.targetPairId]]
        : []
    }),
  )
}

function readOrderingAnswer(
  interaction: Extract<SceneInteraction, { kind: 'ordering' }>,
  attempt?: InteractionAttempt,
) {
  const answer = asRecord(attempt?.answer)
  const itemIds = Array.isArray(answer?.itemIds)
    ? answer.itemIds.filter((value): value is string => typeof value === 'string')
    : []
  const expectedIds = new Set(interaction.items.map((item) => item.id))
  if (
    itemIds.length === interaction.items.length &&
    itemIds.every((itemId) => expectedIds.has(itemId))
  ) {
    return itemIds
  }
  return rotate(interaction.items).map((item) => item.id)
}

function readClozeAnswer(attempt?: InteractionAttempt) {
  const answer = asRecord(attempt?.answer)
  const values = asRecord(answer?.values)
  if (!values) return {}
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}

function readDictationAnswer(attempt?: InteractionAttempt) {
  const answer = asRecord(attempt?.answer)
  return typeof answer?.text === 'string' ? answer.text : ''
}

function readShortAnswer(attempt?: InteractionAttempt) {
  const answer = asRecord(attempt?.answer)
  return typeof answer?.text === 'string' ? answer.text : ''
}

function asRecord(value: JsonValue | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : undefined
}

function rotate<T>(items: T[]) {
  return items.length > 1 ? [...items.slice(1), items[0]] : [...items]
}

function readText(value: LocalizedText, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}
