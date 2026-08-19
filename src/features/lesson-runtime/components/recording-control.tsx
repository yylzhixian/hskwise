'use client'

import {
  CircleAlertIcon,
  MicIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import type {
  RecordingControlAdapter,
  RecordingControlStatus,
} from '../hooks/use-recording-control'
import { useRecordingControl } from '../hooks/use-recording-control'

const recordingStatusLabels: Record<RecordingControlStatus, string> = {
  idle: 'Ready',
  requesting: 'Requesting access',
  recording: 'Recording',
  recorded: 'Recorded',
  denied: 'Microphone denied',
  unsupported: 'Recording unsupported',
  error: 'Recording error',
}

export function RecordingControl({
  adapter,
  completed = false,
  label,
  mediaId,
  onComplete,
}: {
  adapter: RecordingControlAdapter
  completed?: boolean
  label: string
  mediaId: string
  onComplete: (mediaId: string) => void
}) {
  const { recording, reset, start, status, stop } =
    useRecordingControl(adapter)
  const hasUnavailableState = ['denied', 'unsupported', 'error'].includes(status)

  async function stopRecording() {
    const nextStatus = await stop()
    if (nextStatus === 'recorded') onComplete(mediaId)
  }

  return (
    <section aria-labelledby={`${mediaId}-title`} className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MicIcon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold" id={`${mediaId}-title`}>
            {label}
          </h2>
        </div>
        <Badge variant="outline">{recordingStatusLabels[status]}</Badge>
      </div>

      {hasUnavailableState ? (
        <Alert variant={status === 'error' ? 'destructive' : 'warning'}>
          <CircleAlertIcon />
          <AlertTitle>{recordingStatusLabels[status]}</AlertTitle>
          <AlertDescription>
            Continue without recording. This step will remain available later.
          </AlertDescription>
        </Alert>
      ) : null}

      {recording?.url ? (
        <audio
          aria-label="Your recording"
          className="w-full"
          controls
          src={recording.url}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === 'recording' ? (
          <Button onClick={stopRecording} size="learning" variant="learning">
            <SquareIcon data-icon="inline-start" />
            Stop
          </Button>
        ) : (
          <Button
            disabled={
              status === 'requesting' ||
              status === 'recorded' ||
              hasUnavailableState
            }
            onClick={start}
            size="learning"
            variant="learning"
          >
            {status === 'requesting' ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MicIcon data-icon="inline-start" />
            )}
            {status === 'requesting' ? 'Requesting' : 'Record'}
          </Button>
        )}
        <Button
          aria-label="Reset recording"
          onClick={reset}
          size="icon-lg"
          title="Reset recording"
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
            Continue without recording
          </Button>
        ) : null}
      </div>
    </section>
  )
}
