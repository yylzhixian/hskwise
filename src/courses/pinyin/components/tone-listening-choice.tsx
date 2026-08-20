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

import { useAudioPlayback } from '../hooks/use-audio-playback'
import type {
  PinyinLessonStep,
  PinyinTone,
} from '../model/pinyin-lesson-schema'
import { ToneOptionContour } from './tone-contour'

type ToneListeningChoiceStep = Extract<
  PinyinLessonStep,
  { kind: 'tone-listening-choice' }
>

const waveformHeights = [45, 75, 55, 92, 62, 82, 42, 68, 52, 88, 58, 72]

export function ToneListeningChoice({
  disabled,
  onSubmit,
  step,
  tones,
}: {
  disabled: boolean
  onSubmit: (result: { selectedId: string; isCorrect: boolean }) => void
  step: ToneListeningChoiceStep
  tones: PinyinTone[]
}) {
  const [fallbackVisible, setFallbackVisible] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const { audioRef, markEnded, markError, play, status } = useAudioPlayback()
  const options = tones.map((tone) => ({
    id: `tone-${tone.number}`,
    label: tone.name,
    isCorrect: tone.number === step.correctToneNumber,
  }))
  const { select, selectedId, submit } = useChoiceInteraction(options, onSubmit)
  const canAnswer = hasListened || fallbackVisible
  const audioUnavailable = status === 'blocked' || status === 'error'

  return (
    <FieldSet className="w-full gap-6">
      <audio
        onEnded={() => {
          markEnded()
          setHasListened(true)
        }}
        onError={markError}
        preload="metadata"
        ref={audioRef}
        src={step.audio.src}
      />

      <div className="border-y py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-focus">Audio cue</span>
              {step.audio.placeholder ? (
                <Badge variant="outline">TTS placeholder</Badge>
              ) : null}
            </div>
            <div
              aria-hidden="true"
              className="flex h-12 items-center gap-1.5"
            >
              {waveformHeights.map((height, index) => (
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
              ? 'Playing sample'
              : hasListened
                ? 'Play again'
                : 'Play sample'}
          </Button>
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          {status === 'playing'
            ? 'Listen until the sound ends.'
            : canAnswer
              ? 'Choose the pitch path you heard.'
              : 'Answer choices unlock after playback.'}
        </p>
      </div>

      {audioUnavailable ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>
            {status === 'error' ? 'Audio unavailable' : 'Playback did not start'}
          </AlertTitle>
          <AlertDescription>
            <p>Continue with the visible pitch paths so the lesson is not blocked.</p>
            <Button
              onClick={() => setFallbackVisible(true)}
              size="sm"
              variant="outline"
            >
              Use visual fallback
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1">
        <FieldLegend className="mb-0 text-xl font-semibold text-balance">
          {fallbackVisible ? 'Which path matches the tone?' : step.prompt}
        </FieldLegend>
        <FieldDescription>
          {fallbackVisible
            ? 'Audio is unavailable, so use the contour as a fallback.'
            : 'The written examples stay hidden during listening.'}
        </FieldDescription>
      </div>

      <ToggleGroup
        aria-label={step.prompt}
        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
        disabled={disabled || !canAnswer}
        onValueChange={select}
        size="learning"
        value={selectedId ? [selectedId] : []}
        variant="learning"
      >
        {tones.map((tone) => (
          <ToggleGroupItem
            className={
              fallbackVisible ? 'min-h-44 flex-col items-stretch gap-2' : ''
            }
            key={tone.number}
            value={`tone-${tone.number}`}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="font-semibold">Tone {tone.number}</span>
              <CheckIcon className="opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100" />
            </span>
            {fallbackVisible ? (
              <ToneOptionContour tone={tone} />
            ) : null}
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
