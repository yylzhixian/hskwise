'use client'

import { CircleAlertIcon, PlayIcon, Volume2Icon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LexemeView } from '@/courses/interactions/model/activity-view-models'
import { useAudioPlayback } from '@/hooks/media/use-audio-playback'

export function VocabularyContextDiscovery({
  items,
}: {
  items: LexemeView[]
}) {
  const source = items[0]?.source
  const { audioRef, markEnded, markError, play, status } = useAudioPlayback()

  if (!source) return null

  const audioUnavailable = status === 'blocked' || status === 'error'

  return (
    <section className="w-full border-y py-6">
      <audio
        onEnded={markEnded}
        onError={markError}
        preload="metadata"
        ref={audioRef}
        src={source.contextAudio.src}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-focus">From the dialogue</span>
          {source.contextAudio.placeholder ? (
            <Badge variant="outline">TTS placeholder</Badge>
          ) : null}
        </div>
        <Button
          disabled={status === 'playing'}
          onClick={() => void play()}
          size="sm"
          variant="outline"
        >
          {status === 'playing' ? (
            <Volume2Icon data-icon="inline-start" />
          ) : (
            <PlayIcon data-icon="inline-start" />
          )}
          {status === 'playing' ? 'Playing line' : 'Play original line'}
        </Button>
      </div>

      <p className="mt-6 text-3xl leading-11 font-semibold text-balance">
        {source.contextText}
      </p>
      <p className="mt-2 leading-7 text-focus">{source.contextPinyin}</p>
      <p className="mt-1 leading-7 text-muted-foreground">
        {source.contextTranslation}
      </p>

      <div className="mt-6 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-3">
        {items.map((item) => (
          <div className="bg-background px-4 py-3" key={item.id}>
            <p className="text-xl font-semibold">{item.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.meaning}</p>
          </div>
        ))}
      </div>

      {audioUnavailable ? (
        <Alert className="mt-5" variant="warning">
          <CircleAlertIcon />
          <AlertTitle>Context audio unavailable</AlertTitle>
          <AlertDescription>
            Continue with the visible sentence, pinyin, and meaning.
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
