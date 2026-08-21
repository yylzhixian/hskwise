'use client'

import {
  CheckIcon,
  CircleAlertIcon,
  LoaderCircleIcon,
  MicIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  SquareIcon,
  Volume2Icon,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  DialogueLineView,
  DialogueRoleView,
  RolePlayView,
} from '@/courses/interactions/model/activity-view-models'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

import {
  type DialogueRolePracticePhase,
  useDialogueRolePractice,
} from '../hooks/use-dialogue-role-practice'
import { DialoguePracticeReview } from './dialogue-practice-review'

export function DialogueRolePractice({
  completed,
  lines,
  onComplete,
  roles,
  step,
}: {
  completed: boolean
  lines: DialogueLineView[]
  onComplete: () => void
  roles: DialogueRoleView[]
  step: RolePlayView
}) {
  const {
    activeLineId,
    audioRef,
    audioStatus,
    completedLineCount,
    countdownRemaining,
    currentLine,
    currentLineIndex,
    isFinished,
    isUserTurn,
    markAudioEnded,
    markAudioError,
    phase,
    playReferenceLine,
    practiceRoleId,
    resetConversation,
    retryCurrentTurn,
    selectRole,
    skipCountdown,
    skipUnavailableTurn,
    startConversation,
    started,
    stopRecording,
    turnRecordings,
  } = useDialogueRolePractice({
    completed,
    countdownSeconds: step.countdownSeconds,
    handoffDelayMs: step.handoffDelayMs,
    initialRoleId: step.roleIds[0],
    lines,
    onComplete,
  })
  const rolesById = new Map(roles.map(role => [role.id, role]))
  const practiceRole = rolesById.get(practiceRoleId)
  const currentRole = currentLine ? rolesById.get(currentLine.speakerId) : null
  const practiceLines = lines.filter(
    (line) => line.speakerId === practiceRoleId,
  )

  return (
    <section className="flex w-full flex-col gap-5">
      <audio
        onEnded={markAudioEnded}
        onError={markAudioError}
        preload="metadata"
        ref={audioRef}
      />

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-focus">Choose your role</p>
          <Badge variant="outline">TTS placeholder</Badge>
        </div>
        <ToggleGroup
          aria-label="Practice role"
          className="mt-3 grid w-full grid-cols-2 gap-3"
          disabled={started}
          onValueChange={selectRole}
          size="learning"
          value={[practiceRoleId]}
          variant="learning"
        >
          {roles.map(role => (
            <ToggleGroupItem
              className="min-h-20 min-w-0 flex-col items-start overflow-hidden whitespace-normal"
              key={role.id}
              value={role.id}
            >
              <span className="text-lg font-semibold">{role.name}</span>
              <span className="text-start text-xs leading-4 font-normal text-wrap text-muted-foreground">
                {role.cue}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {!started ? (
        <div className="flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">You are {practiceRole?.name}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The conversation will pause and record automatically on your
              turns.
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={startConversation}
            size="learning"
            variant="learning"
          >
            <PlayIcon data-icon="inline-start" />
            Start conversation
          </Button>
        </div>
      ) : null}

      {started && !isFinished && currentLine ? (
        <CurrentTurn
          currentLine={currentLine}
          currentRole={currentRole}
          countdownRemaining={countdownRemaining}
          isUserTurn={isUserTurn}
          lineNumber={currentLineIndex + 1}
          onRetry={retryCurrentTurn}
          onSkipCountdown={skipCountdown}
          onSkip={skipUnavailableTurn}
          onStopRecording={stopRecording}
          phase={phase}
          totalLines={lines.length}
        />
      ) : null}

      {isFinished ? (
        <DialoguePracticeReview
          activeLineId={activeLineId}
          audioStatus={audioStatus}
          lines={practiceLines}
          onPlayReference={playReferenceLine}
          onPracticeAgain={resetConversation}
          practiceRole={practiceRole}
          recordings={turnRecordings}
        />
      ) : null}

      {!isFinished ? (
        <ol aria-label="Conversation progress" className="flex flex-col gap-2">
          {lines.map((line, index) => {
            const role = rolesById.get(line.speakerId)
            const lineIsUserTurn = line.speakerId === practiceRoleId
            const isCurrent = started && index === currentLineIndex
            const isDone = started && index < completedLineCount

            return (
              <li
                className={cn(
                  'grid min-h-16 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-1 py-3 transition-colors',
                  isCurrent && 'border-focus bg-accent/40 px-3',
                  isDone && 'text-muted-foreground',
                )}
                key={line.id}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums',
                    isDone &&
                      'border-route-complete-border text-route-complete-foreground bg-route-complete-surface',
                    isCurrent && 'border-focus text-focus',
                  )}
                >
                  {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold">{role?.name}</p>
                    {lineIsUserTurn ? (
                      <span className="text-xs text-focus">Your turn</span>
                    ) : null}
                  </div>
                  <p className="truncate text-base font-semibold">
                    {line.tokens.map(token => token.text).join('')}
                  </p>
                </div>
                {lineIsUserTurn ? (
                  <MicIcon className="size-4 text-muted-foreground" />
                ) : (
                  <Volume2Icon className="size-4 text-muted-foreground" />
                )}
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}

function CurrentTurn({
  countdownRemaining,
  currentLine,
  currentRole,
  isUserTurn,
  lineNumber,
  onRetry,
  onSkipCountdown,
  onSkip,
  onStopRecording,
  phase,
  totalLines,
}: {
  countdownRemaining: number | null
  currentLine: DialogueLineView
  currentRole?: DialogueRoleView | null
  isUserTurn: boolean
  lineNumber: number
  onRetry: () => void
  onSkipCountdown: () => void
  onSkip: () => void
  onStopRecording: () => void
  phase: DialogueRolePracticePhase
  totalLines: number
}) {
  const microphoneUnavailable = phase === 'microphone-unavailable'
  const audioUnavailable = phase === 'audio-unavailable'

  return (
    <div
      aria-live="polite"
      className={cn(
        'border-y px-1 py-6 sm:px-5',
        phase === 'recording-user' && 'border-destructive/60 bg-destructive/5',
        phase === 'countdown-user' && 'border-focus/60 bg-accent/25',
        phase === 'handoff-user' &&
          'border-route-complete-border bg-route-complete-surface/55',
        phase === 'playing-partner' &&
          'border-primary/50 bg-route-complete-surface/55'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'size-2 rounded-full bg-muted-foreground',
              phase === 'recording-user' && 'animate-pulse bg-destructive',
              phase === 'countdown-user' && 'bg-focus',
              phase === 'handoff-user' && 'bg-route-complete-foreground',
              phase === 'playing-partner' && 'animate-pulse bg-primary'
            )}
          />
          <p className="text-sm font-semibold">
            {getPhaseLabel(phase, currentRole?.name, countdownRemaining)}
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {lineNumber} / {totalLines}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-muted-foreground">
          {currentRole?.name} · {currentRole?.pinyin}
        </p>
        <p className="mt-2 text-3xl leading-tight font-semibold text-balance">
          {currentLine.tokens.map(token => token.text).join('')}
        </p>
        <p className="mt-3 text-sm leading-6 text-focus">
          {currentLine.pinyin}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {currentLine.translation}
        </p>
      </div>

      {phase === 'countdown-user' && countdownRemaining !== null ? (
        <div className="mt-6 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-focus bg-background text-2xl font-semibold tabular-nums text-focus">
              {countdownRemaining}
            </span>
            <div>
              <p className="font-semibold">Take a breath</p>
              <p className="text-sm text-muted-foreground">
                Recording starts automatically.
              </p>
            </div>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={onSkipCountdown}
            size="sm"
            variant="outline"
          >
            <SkipForwardIcon data-icon="inline-start" />
            Start now
          </Button>
        </div>
      ) : null}

      {phase === 'recording-user' ? (
        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={onStopRecording}
          size="learning"
          variant="destructive"
        >
          <SquareIcon data-icon="inline-start" />
          Finish my turn
        </Button>
      ) : null}

      {phase === 'requesting-microphone' ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" />
          Preparing microphone
        </div>
      ) : null}

      {phase === 'playing-partner' ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2Icon className="size-4" />
          The next turn starts when this line ends.
        </div>
      ) : null}

      {phase === 'handoff-user' ? (
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-route-complete-border">
            <CheckIcon className="size-4" />
          </span>
          <div>
            <p className="text-route-complete-foreground font-semibold">
              Turn complete
            </p>
            <p className="text-route-complete-foreground/80">
              The next line starts in a moment.
            </p>
          </div>
        </div>
      ) : null}

      {microphoneUnavailable || audioUnavailable ? (
        <Alert className="mt-6" variant="warning">
          <CircleAlertIcon />
          <AlertTitle>
            {microphoneUnavailable
              ? 'Microphone unavailable for this turn'
              : 'Line audio did not play'}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={onRetry} size="sm" variant="outline">
                <RotateCcwIcon data-icon="inline-start" />
                Try again
              </Button>
              <Button onClick={onSkip} size="sm" variant="ghost">
                Continue this turn without {isUserTurn ? 'recording' : 'audio'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function getPhaseLabel(
  phase: DialogueRolePracticePhase,
  roleName?: string,
  countdownRemaining?: number | null
) {
  switch (phase) {
    case 'playing-partner':
      return `${roleName ?? 'Partner'} is speaking`
    case 'countdown-user':
      return `Your turn in ${countdownRemaining ?? 3}`
    case 'requesting-microphone':
      return 'Your turn is next'
    case 'recording-user':
      return 'Your turn · recording'
    case 'handoff-user':
      return 'Your turn · complete'
    case 'audio-unavailable':
      return `${roleName ?? 'Partner'} · playback paused`
    case 'microphone-unavailable':
      return 'Your turn · recording paused'
    case 'complete':
      return 'Conversation complete'
    case 'ready':
      return 'Ready to begin'
  }
}
