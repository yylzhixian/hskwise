'use client'

import {
  CheckCircle2Icon,
  CircleAlertIcon,
  MicIcon,
  PlayIcon,
  RotateCcwIcon,
  Volume2Icon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { DialogueTurnRecording } from '../hooks/use-dialogue-role-practice'
import type {
  DialogueLine,
  DialogueRole,
} from '../model/dialogue-lesson-schema'

export function DialoguePracticeReview({
  activeLineId,
  audioStatus,
  lines,
  onPlayReference,
  onPracticeAgain,
  practiceRole,
  recordings,
}: {
  activeLineId: string | null
  audioStatus: 'idle' | 'playing' | 'blocked' | 'error'
  lines: DialogueLine[]
  onPlayReference: (line: DialogueLine) => Promise<boolean>
  onPracticeAgain: () => void
  practiceRole?: DialogueRole
  recordings: DialogueTurnRecording[]
}) {
  const recordingsByLineId = new Map(
    recordings.map(recording => [recording.lineId, recording])
  )
  const evaluation = evaluateDialoguePractice(
    lines.map(line => line.id),
    recordings
  )

  return (
    <section aria-labelledby="dialogue-practice-feedback" className="w-full">
      <div className="border-y border-route-complete-border bg-route-complete-surface px-4 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-route-complete-border">
              <CheckCircle2Icon />
            </span>
            <div>
              <p className="text-xs font-semibold text-route-complete-foreground/70">
                Practice feedback
              </p>
              <h2
                className="mt-1 text-xl font-semibold text-route-complete-foreground"
                id="dialogue-practice-feedback"
              >
                {evaluation.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-route-complete-foreground/80">
                {evaluation.summary}
              </p>
            </div>
          </div>
          <Button
            className="w-full dark:border-white/80 sm:w-auto"
            onClick={onPracticeAgain}
            size="sm"
            variant="outline"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Practice again
          </Button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-route-complete-border bg-route-complete-border">
          <div className="bg-route-complete-surface px-3 py-3">
            <dt className="text-xs text-route-complete-foreground/70">
              Turn taking
            </dt>
            <dd className="mt-1 font-semibold text-route-complete-foreground">
              {lines.length} / {lines.length} complete
            </dd>
          </div>
          <div className="bg-route-complete-surface px-3 py-3">
            <dt className="text-xs text-route-complete-foreground/70">
              Voice captured
            </dt>
            <dd className="mt-1 font-semibold text-route-complete-foreground">
              {evaluation.recordedCount} / {evaluation.expectedCount} turns
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-semibold">Compare your turns</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Listen for tone shape, syllable length, and where the model pauses.
          </p>
        </div>
        <Badge variant="outline">Model audio placeholder</Badge>
      </div>

      <div className="mt-3">
        {lines.map((line, index) => {
          const recording = recordingsByLineId.get(line.id)
          const isPlaying =
            activeLineId === line.id && audioStatus === 'playing'
          const modelUnavailable =
            activeLineId === line.id &&
            (audioStatus === 'blocked' || audioStatus === 'error')

          return (
            <article className="border-b py-5" key={line.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-focus">
                    {practiceRole?.name} · turn {index + 1}
                  </p>
                  <p className="mt-1 text-xl leading-8 font-semibold text-wrap">
                    {line.tokens.map(token => token.text).join('')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {line.pinyin}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="min-w-0 border-s-2 border-primary ps-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Model audio
                  </p>
                  <Button
                    className="mt-2 w-full justify-start"
                    onClick={() => void onPlayReference(line)}
                    size="sm"
                    variant="outline"
                  >
                    {isPlaying ? (
                      <Volume2Icon data-icon="inline-start" />
                    ) : (
                      <PlayIcon data-icon="inline-start" />
                    )}
                    {isPlaying
                      ? 'Playing model'
                      : modelUnavailable
                        ? 'Retry model audio'
                        : 'Play model audio'}
                  </Button>
                </div>

                <div className="min-w-0 border-s-2 border-focus ps-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Your recording
                    </p>
                    {recording ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {(recording.durationMs / 1000).toFixed(1)}s
                      </span>
                    ) : null}
                  </div>
                  {recording ? (
                    <audio
                      aria-label={`Your recording for turn ${index + 1}`}
                      className="mt-2 h-9 w-full"
                      controls
                      preload="metadata"
                      src={recording.url}
                    />
                  ) : (
                    <div className="mt-2 flex min-h-9 items-center gap-2 text-sm text-muted-foreground">
                      <CircleAlertIcon className="size-4" />
                      No recording for this turn
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-3 border-s-2 border-focus ps-4">
        <MicIcon className="mt-0.5 size-4 shrink-0 text-focus" />
        <div>
          <p className="text-sm font-semibold">Next focus</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Replay any turn where your tones, pacing, or final pause sound
            different from the model, then practice that role again.
          </p>
        </div>
      </div>
    </section>
  )
}

export function evaluateDialoguePractice(
  expectedLineIds: string[],
  recordings: Pick<DialogueTurnRecording, 'lineId'>[]
) {
  const recordedLineIds = new Set(recordings.map(recording => recording.lineId))
  const recordedCount = expectedLineIds.reduce(
    (count, lineId) => count + Number(recordedLineIds.has(lineId)),
    0
  )
  const expectedCount = expectedLineIds.length
  const capturedEveryTurn = expectedCount > 0 && recordedCount === expectedCount

  return {
    expectedCount,
    recordedCount,
    summary: capturedEveryTurn
      ? 'You answered every cue and captured each of your lines. Compare your voice with the model before continuing.'
      : `You completed the exchange and recorded ${recordedCount} of ${expectedCount} turns. Review the missing turns before your next take.`,
    title: capturedEveryTurn
      ? 'Complete exchange'
      : 'Exchange complete · recording incomplete',
  }
}
