'use client'

import {
  CircleAlertIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  Volume2Icon,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import {
  type AudioControlAdapter,
  type AudioControlStatus,
  useAudioControl,
} from '../hooks/use-audio-control'

const audioStatusLabels: Record<AudioControlStatus, string> = {
  idle: 'Ready',
  loading: 'Loading',
  playing: 'Playing',
  paused: 'Paused',
  unavailable: 'Unavailable',
  blocked: 'Playback blocked',
  error: 'Playback error',
}

export function AudioControl({
  adapter,
  completed = false,
  label,
  mediaId,
  onComplete,
}: {
  adapter: AudioControlAdapter
  completed?: boolean
  label: string
  mediaId: string
  onComplete: (mediaId: string) => void
}) {
  const { pause, play, reset, status } = useAudioControl(adapter)
  const hasUnavailableState = ['unavailable', 'blocked', 'error'].includes(status)

  async function playAudio() {
    const nextStatus = await play()
    if (nextStatus === 'playing') onComplete(mediaId)
  }

  return (
    <section aria-labelledby={`${mediaId}-title`} className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Volume2Icon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold" id={`${mediaId}-title`}>
            {label}
          </h2>
        </div>
        <Badge variant="outline">{audioStatusLabels[status]}</Badge>
      </div>

      {hasUnavailableState ? (
        <Alert variant={status === 'error' ? 'destructive' : 'warning'}>
          <CircleAlertIcon />
          <AlertTitle>{audioStatusLabels[status]}</AlertTitle>
          <AlertDescription>
            Continue without audio or try playback again.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === 'playing' ? (
          <Button onClick={pause} size="learning" variant="outline">
            <PauseIcon data-icon="inline-start" />
            Pause
          </Button>
        ) : (
          <Button
            disabled={status === 'loading' || status === 'unavailable'}
            onClick={playAudio}
            size="learning"
            variant="learning"
          >
            {status === 'loading' ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {status === 'loading' ? 'Loading' : 'Play'}
          </Button>
        )}
        <Button
          aria-label="Reset audio"
          onClick={reset}
          size="icon-lg"
          title="Reset audio"
          variant="ghost"
        >
          <RotateCcwIcon />
        </Button>
        {hasUnavailableState && !completed ? (
          <Button
            onClick={() => onComplete(mediaId)}
            size="learning"
            variant="outline"
          >
            Continue without audio
          </Button>
        ) : null}
      </div>
    </section>
  )
}
