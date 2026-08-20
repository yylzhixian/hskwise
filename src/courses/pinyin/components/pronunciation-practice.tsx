'use client'

import {
  CircleAlertIcon,
  MicIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  Volume2Icon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { usePronunciationRecorder } from '../hooks/use-pronunciation-recorder'
import type { PinyinLessonStep } from '../model/pinyin-lesson-schema'

type PronunciationPracticeStep = Extract<
  PinyinLessonStep,
  { kind: 'pronunciation-practice' }
>

type ReferenceStatus = 'idle' | 'playing' | 'blocked' | 'error'

export function PronunciationPractice({
  completed,
  onComplete,
  step,
}: {
  completed: boolean
  onComplete: () => void
  step: PronunciationPracticeStep
}) {
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null)
  const [referenceStatus, setReferenceStatus] =
    useState<ReferenceStatus>('idle')
  const { recordingUrl, reset, start, status, stop } =
    usePronunciationRecorder()

  useEffect(() => {
    if (status === 'recorded' && !completed) onComplete()
  }, [completed, onComplete, status])

  async function playReference() {
    const audio = referenceAudioRef.current
    if (!audio) return

    audio.currentTime = 0
    try {
      await audio.play()
      setReferenceStatus('playing')
    } catch {
      setReferenceStatus('blocked')
    }
  }

  const canContinueWithoutRecording =
    status === 'requesting' ||
    status === 'denied' ||
    status === 'unsupported' ||
    status === 'error'

  return (
    <section className="flex w-full flex-col gap-6">
      <audio
        onEnded={() => setReferenceStatus('idle')}
        onError={() => setReferenceStatus('error')}
        preload="metadata"
        ref={referenceAudioRef}
        src={step.referenceAudio.src}
      />

      <div className="flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-focus">
              Reference
            </span>
            {step.referenceAudio.placeholder ? (
              <Badge variant="outline">TTS placeholder</Badge>
            ) : null}
          </div>
          <p className="text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
            {step.target}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => void playReference()}
          size="learning"
          variant="outline"
        >
          {referenceStatus === 'playing' ? (
            <Volume2Icon data-icon="inline-start" />
          ) : (
            <PlayIcon data-icon="inline-start" />
          )}
          {referenceStatus === 'playing' ? 'Playing sample' : 'Play sample'}
        </Button>
      </div>

      {referenceStatus === 'error' || referenceStatus === 'blocked' ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>
            {referenceStatus === 'error'
              ? 'Reference audio unavailable'
              : 'Playback did not start'}
          </AlertTitle>
          <AlertDescription>
            Use the visible tone marks as your guide, then continue with your
            own recording.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4">
        <div>
          <p className="font-semibold">Your voice</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep one steady breath and make each pitch direction distinct.
          </p>
        </div>

        {status === 'recorded' && recordingUrl ? (
          <div className="flex flex-col gap-3 border-y py-4">
            <audio
              aria-label="Your pronunciation recording"
              className="h-10 w-full"
              controls
              src={recordingUrl}
            />
            <Button
              className="self-start"
              onClick={reset}
              size="sm"
              variant="ghost"
            >
              <RotateCcwIcon data-icon="inline-start" />
              Record again
            </Button>
          </div>
        ) : (
          <Button
            className="w-full sm:self-start sm:w-auto"
            disabled={status === 'requesting'}
            onClick={status === 'recording' ? stop : () => void start()}
            size="learning"
            variant={status === 'recording' ? 'destructive' : 'learning'}
          >
            {status === 'recording' ? (
              <SquareIcon data-icon="inline-start" />
            ) : (
              <MicIcon data-icon="inline-start" />
            )}
            {status === 'requesting'
              ? 'Requesting microphone'
              : status === 'recording'
                ? 'Stop recording'
                : 'Start recording'}
          </Button>
        )}
      </div>

      {canContinueWithoutRecording ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>
            {status === 'requesting'
              ? 'Waiting for microphone permission'
              : status === 'denied'
              ? 'Microphone permission denied'
              : status === 'unsupported'
                ? 'Recording is not supported here'
                : 'Recording could not be saved'}
          </AlertTitle>
          <AlertDescription>
            <p>Practice aloud without recording. This will not block the lesson.</p>
            <Button onClick={onComplete} size="sm" variant="outline">
              Continue without recording
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
