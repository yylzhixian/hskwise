'use client'

import {
  CheckIcon,
  CircleAlertIcon,
  PlayIcon,
  Volume2Icon,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { useChoiceInteraction } from '@/hooks/lesson/use-choice-interaction'
import { useAudioPlayback } from '@/hooks/media/use-audio-playback'

import type {
  VocabularyItem,
  VocabularyLessonStep,
} from '../model/vocabulary-lesson-schema'

type ListeningStep = Extract<
  VocabularyLessonStep,
  { kind: 'listening-choice' }
>

const waveform = [42, 72, 54, 88, 66, 46, 80, 58, 92, 62, 76, 48]

export function VocabularyListeningChoice({
  disabled,
  item,
  onSubmit,
  step,
}: {
  disabled: boolean
  item: VocabularyItem
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
  step: ListeningStep
}) {
  const [fallbackVisible, setFallbackVisible] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const { audioRef, markEnded, markError, play, status } = useAudioPlayback()
  const { select, selectedId, submit } = useChoiceInteraction(
    step.options,
    onSubmit,
  )
  const audioUnavailable = status === 'blocked' || status === 'error'
  const canAnswer = hasListened || fallbackVisible

  return (
    <FieldSet className="w-full gap-5">
      <audio
        onEnded={() => {
          markEnded()
          setHasListened(true)
        }}
        onError={markError}
        preload="metadata"
        ref={audioRef}
        src={item.audio.src}
      />

      <div className="border-y py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-focus">Word audio</span>
              <Badge variant="outline">TTS placeholder</Badge>
            </div>
            <div aria-hidden="true" className="flex h-11 items-center gap-1.5">
              {waveform.map((height, index) => (
                <span
                  className={
                    status === 'playing'
                      ? 'w-1 rounded-full bg-focus motion-safe:animate-pulse'
                      : 'w-1 rounded-full bg-muted-foreground/35'
                  }
                  key={`${height}-${index}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={disabled || status === 'playing'}
            onClick={() => void play()}
            size="learning"
            variant="outline"
          >
            {status === 'playing' ? (
              <Volume2Icon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {status === 'playing'
              ? 'Playing word'
              : hasListened
                ? 'Play again'
                : 'Play word'}
          </Button>
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {status === 'playing'
            ? 'Listen until the short cue ends.'
            : canAnswer
              ? 'Choose the written word that matches.'
              : 'Choices unlock after playback.'}
        </p>
      </div>

      {audioUnavailable ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>Word audio unavailable</AlertTitle>
          <AlertDescription>
            <p>Use the pinyin fallback so playback does not block the lesson.</p>
            <Button
              onClick={() => setFallbackVisible(true)}
              size="sm"
              variant="outline"
            >
              Show pinyin fallback
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {step.prompt}
        </FieldLegend>
        <FieldDescription>
          {fallbackVisible ? `Audio fallback: ${item.pinyin}` : 'Choose by sound before meaning.'}
        </FieldDescription>
      </div>

      <ToggleGroup
        aria-label={step.prompt}
        className="grid w-full grid-cols-2 gap-3"
        disabled={disabled || !canAnswer}
        onValueChange={select}
        size="learning"
        value={selectedId ? [selectedId] : []}
        variant="learning"
      >
        {step.options.map((option) => (
          <ToggleGroupItem
            className="min-h-20 justify-between"
            key={option.id}
            value={option.id}
          >
            <span className="flex flex-col items-start">
              <span className="text-xl font-semibold">{option.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {option.supportingText}
              </span>
            </span>
            <CheckIcon className="opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100" />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Button
        className="w-full sm:ms-auto sm:w-auto"
        disabled={disabled || !canAnswer || !selectedId}
        onClick={submit}
        size="learning"
        variant="learning"
      >
        Check answer
      </Button>
    </FieldSet>
  )
}
