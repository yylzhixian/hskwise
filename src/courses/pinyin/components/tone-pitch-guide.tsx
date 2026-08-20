'use client'

import {
  CheckIcon,
  CircleAlertIcon,
  PlayIcon,
  WavesIcon,
} from 'lucide-react'
import { useCallback } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { useTonePitchGuide } from '../hooks/use-tone-pitch-guide'
import type { PinyinTone } from '../model/pinyin-lesson-schema'
import { ToneContour } from './tone-contour'

export function TonePitchGuide({
  completed,
  onComplete,
  tones,
}: {
  completed: boolean
  onComplete: () => void
  tones: PinyinTone[]
}) {
  const completeOnce = useCallback(() => {
    if (!completed) onComplete()
  }, [completed, onComplete])
  const { playedToneNumbers, playingTone, playTone, status } =
    useTonePitchGuide(tones.length, completeOnce)

  return (
    <section className="flex w-full flex-col gap-5">
      <Alert>
        <WavesIcon />
        <AlertTitle>Pitch-direction guide</AlertTitle>
        <AlertDescription>
          These synthesized tones show movement only. They are not a model of
          Mandarin pronunciation.
        </AlertDescription>
      </Alert>

      <ul className="divide-y border-y">
        {tones.map((tone) => {
          const hasPlayed = playedToneNumbers.has(tone.number)
          const isPlaying = playingTone === tone.number

          return (
            <li
              className="grid min-h-24 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3"
              key={tone.number}
            >
              <Button
                aria-label={`Play ${tone.name} pitch guide`}
                disabled={playingTone !== null}
                onClick={() => void playTone(tone)}
                size="icon-lg"
                title={`Play ${tone.name}`}
                variant={hasPlayed ? 'secondary' : 'outline'}
              >
                {hasPlayed ? <CheckIcon /> : <PlayIcon />}
              </Button>
              <ToneContour active={isPlaying} tone={tone} />
              <div className="flex min-w-18 flex-col items-end gap-1">
                <span className="font-semibold">{tone.example}</span>
                <Badge variant="outline">Tone {tone.number}</Badge>
              </div>
            </li>
          )
        })}
      </ul>

      {status === 'unsupported' ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>Pitch playback unavailable</AlertTitle>
          <AlertDescription>
            <p>
              Continue with the visible tone paths. Spoken examples will use
              original recordings in a later content pass.
            </p>
            <Button onClick={completeOnce} size="sm" variant="outline">
              Continue with visual guide
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  )
}
