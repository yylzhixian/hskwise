'use client'

import { CircleAlertIcon, PlayIcon, Volume2Icon } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'
import { useAudioPlayback } from '@/hooks/media/use-audio-playback'

import { ActivityChoiceField } from '../components/activity-choice-field'
import type { ActivityRendererProps } from '../model/renderer-contract'

type ChoiceActivity = Extract<LessonActivity, { type: 'single-choice/v1' }>

export function SingleChoiceRenderer({
  activity,
  actions,
  resources,
  state,
}: ActivityRendererProps<ChoiceActivity>) {
  const [fallbackVisible, setFallbackVisible] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const { audioRef, markEnded, markError, play, status } = useAudioPlayback()
  const audio =
    activity.stimulus?.kind === 'audio'
      ? resources.mediaById[activity.stimulus.ref]
      : undefined
  const audioUnavailable = status === 'blocked' || status === 'error'
  const canAnswer = !audio || hasListened || fallbackVisible

  return (
    <div className="flex w-full flex-col gap-5">
      {audio ? (
        <section className="border-y py-5">
          <audio
            onEnded={() => {
              markEnded()
              setHasListened(true)
            }}
            onError={markError}
            preload="metadata"
            ref={audioRef}
            src={audio.src}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-focus">Audio prompt</span>
              {audio.rights.origin === 'generated-placeholder' ? (
                <Badge variant="outline">TTS placeholder</Badge>
              ) : null}
            </div>
            <Button
              disabled={state.disabled || status === 'playing'}
              onClick={() => void play()}
              size="learning"
              variant="outline"
            >
              {status === 'playing' ? (
                <Volume2Icon data-icon="inline-start" />
              ) : (
                <PlayIcon data-icon="inline-start" />
              )}
              {hasListened ? 'Play again' : 'Play audio'}
            </Button>
          </div>
        </section>
      ) : (
        <StimulusPreview activity={activity} resources={resources} />
      )}

      {audioUnavailable ? (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertTitle>Audio unavailable</AlertTitle>
          <AlertDescription>
            <p>Continue with a visible fallback so playback does not block the lesson.</p>
            <Button
              onClick={() => setFallbackVisible(true)}
              size="sm"
              variant="outline"
            >
              Show choices
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <ActivityChoiceField
        answer={activity.answer}
        description={
          audio && !canAnswer
            ? 'Choices unlock after playback.'
            : 'Choose the answer that best matches the prompt.'
        }
        disabled={state.disabled || !canAnswer}
        onSubmit={({ answer, isCorrect }) =>
          actions.submitResponse({ answer, isCorrect })
        }
        options={activity.options}
        prompt={activity.prompt}
      />
    </div>
  )
}

function StimulusPreview({
  activity,
  resources,
}: Pick<ActivityRendererProps<ChoiceActivity>, 'activity' | 'resources'>) {
  const stimulus = activity.stimulus
  if (!stimulus) return null
  if (stimulus.kind === 'lexeme') {
    const lexeme = resources.lexemesById[stimulus.ref]
    return lexeme ? (
      <div className="border-y py-6 text-center">
        <p className="text-5xl font-semibold">{lexeme.text}</p>
        <p className="mt-2 text-focus">{lexeme.pinyin}</p>
      </div>
    ) : null
  }
  const dialogue =
    stimulus.kind === 'dialogue'
      ? resources.dialoguesById[stimulus.ref]
      : stimulus.kind === 'dialogue-line'
        ? resources.dialoguesById[stimulus.dialogueRef]
        : undefined
  if (!dialogue) return null
  const lines =
    stimulus.kind === 'dialogue-line'
      ? dialogue.lines.filter((line) => line.id === stimulus.lineRef)
      : dialogue.lines
  return (
    <div className="border-y py-5">
      {lines.map((line) => (
        <p className="py-1 text-lg leading-7" key={line.id}>
          {line.tokens.map((token) => token.text).join('')}
        </p>
      ))}
    </div>
  )
}
