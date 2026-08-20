'use client'

import {
  CircleAlertIcon,
  EyeIcon,
  LanguagesIcon,
  PlayIcon,
  Volume2Icon,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useDialogueExplorer } from '../hooks/use-dialogue-explorer'
import type {
  DialogueLine,
  DialogueRole,
} from '../model/dialogue-lesson-schema'

export function DialogueExplorer({
  completed,
  lines,
  onComplete,
  roles,
}: {
  completed: boolean
  lines: DialogueLine[]
  onComplete: () => void
  roles: DialogueRole[]
}) {
  const {
    activeLineId,
    audioRef,
    markEnded,
    markError,
    playLine,
    selectLine,
    selectedLineId,
    selectedTokenId,
    selectToken,
    showMeaning,
    showPinyin,
    status,
    toggleMeaning,
    togglePinyin,
    playedCount,
  } = useDialogueExplorer({ completed, lines, onComplete })
  const rolesById = new Map(roles.map((role) => [role.id, role]))
  const selectedLine = lines.find(
    (line) => line.id === selectedLineId,
  )
  const selectedToken = selectedLine?.tokens.find(
    (token) => token.id === selectedTokenId,
  )
  const mediaUnavailable = status === 'blocked' || status === 'error'

  return (
    <section className="w-full">
      <audio
        onEnded={markEnded}
        onError={markError}
        preload="metadata"
        ref={audioRef}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-3">
        <div className="flex gap-4">
          {roles.map((role, index) => (
            <div className="flex items-center gap-2" key={role.id}>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                  index === 0
                    ? 'bg-focus text-focus-foreground'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {role.name.slice(0, 1)}
              </span>
              <span className="text-sm font-medium">{role.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">TTS placeholder</Badge>
          <span>{playedCount} / {lines.length} listened</span>
        </div>
      </div>

      <ol className="relative flex flex-col gap-4 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border">
        {lines.map((line) => {
          const roleIndex = roles.findIndex((role) => role.id === line.speakerId)
          const role = rolesById.get(line.speakerId)
          const isSelected = line.id === selectedLineId
          const isPlaying =
            line.id === activeLineId && status === 'playing'

          return (
            <li
              className={cn(
                'relative z-10 w-[calc(100%-1.5rem)] sm:w-[86%]',
                roleIndex === 0 ? 'self-start pe-5' : 'self-end ps-5',
              )}
              key={line.id}
            >
              <article
                className={cn(
                  'rounded-md border bg-card p-4 transition-colors',
                  isSelected && 'border-focus bg-accent/45',
                  isPlaying && 'border-primary bg-route-complete-surface',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{role?.name}</p>
                    <p className="text-xs text-muted-foreground">{role?.pinyin}</p>
                  </div>
                  <Button
                    aria-label={`Play ${role?.name ?? 'speaker'} line`}
                    onClick={() => void playLine(line)}
                    size="icon-sm"
                    title="Play line"
                    variant="ghost"
                  >
                    {isPlaying ? <Volume2Icon /> : <PlayIcon />}
                  </Button>
                </div>

                <button
                  className="mt-3 w-full text-start text-2xl leading-10 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => selectLine(line.id)}
                  type="button"
                >
                  {line.tokens.map((token) => token.text).join('')}
                </button>

                {isSelected ? (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        aria-pressed={showPinyin}
                        onClick={togglePinyin}
                        size="sm"
                        variant="ghost"
                      >
                        <LanguagesIcon data-icon="inline-start" />
                        Pinyin
                      </Button>
                      <Button
                        aria-pressed={showMeaning}
                        onClick={toggleMeaning}
                        size="sm"
                        variant="ghost"
                      >
                        <EyeIcon data-icon="inline-start" />
                        Meaning
                      </Button>
                    </div>

                    {showPinyin ? (
                      <p className="mt-3 text-sm leading-6 text-focus">
                        {line.pinyin}
                      </p>
                    ) : null}
                    {showMeaning ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {line.translation}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-2">
                      {line.tokens.map((token) =>
                        token.meaning ? (
                          <button
                            className={cn(
                              'border-b border-dotted border-muted-foreground text-lg outline-none hover:border-focus hover:text-focus focus-visible:ring-2 focus-visible:ring-ring',
                              selectedTokenId === token.id &&
                                'border-focus text-focus',
                            )}
                            key={token.id}
                            onClick={() => selectToken(token.id)}
                            type="button"
                          >
                            {token.text}
                          </button>
                        ) : (
                          <span className="text-lg" key={token.id}>{token.text}</span>
                        ),
                      )}
                    </div>

                    {selectedToken?.meaning ? (
                      <div className="mt-4 border-s-2 border-focus ps-3 text-sm">
                        <p className="font-semibold">
                          {selectedToken.text} · {selectedToken.pinyin}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {selectedToken.meaning}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </li>
          )
        })}
      </ol>

      {mediaUnavailable ? (
        <Alert className="mt-5" variant="warning">
          <CircleAlertIcon />
          <AlertTitle>
            {status === 'error'
              ? 'Line audio unavailable'
              : 'Playback did not start'}
          </AlertTitle>
          <AlertDescription>
            Retry the line when playback is available. Each line must finish
            before you can continue.
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
