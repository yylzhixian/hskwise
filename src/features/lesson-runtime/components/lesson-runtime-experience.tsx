'use client'

import { CheckCircle2Icon, SparklesIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

import {
  runtimeChoiceOptions,
  runtimeLabDefinition,
  runtimeOrderingItems,
} from '../content/runtime-lab-definition'
import type { RuntimeMediaFixtureId } from '../fixtures/runtime-media-fixtures'
import { useLessonSession } from '../hooks/use-lesson-session'
import { useLessonStep } from '../hooks/use-lesson-step'
import { useRuntimeMediaFixture } from '../hooks/use-runtime-media-fixture'
import { LessonStoreProvider } from '../provider/lesson-store-provider'
import { ChoiceInteraction } from './choice-interaction'
import { DevRuntimeScenarioSwitcher } from './dev-runtime-scenario-switcher'
import { LessonFrame } from './lesson-frame'
import { OrderingInteraction } from './ordering-interaction'

const AudioControl = dynamic(
  () => import('./audio-control').then((module) => module.AudioControl),
  { loading: MediaControlLoading },
)
const RecordingControl = dynamic(
  () =>
    import('./recording-control').then((module) => module.RecordingControl),
  { loading: MediaControlLoading },
)

function MediaControlLoading() {
  return (
    <div className="flex min-h-32 w-full items-center justify-center">
      <Spinner className="size-6 text-focus" />
    </div>
  )
}

export function LessonRuntimeExperience({
  mediaFixtureId,
}: {
  mediaFixtureId: RuntimeMediaFixtureId
}) {
  return (
    <LessonStoreProvider
      definition={runtimeLabDefinition}
      key={`${runtimeLabDefinition.id}:${mediaFixtureId}`}
    >
      <RuntimeLabSession mediaFixtureId={mediaFixtureId} />
    </LessonStoreProvider>
  )
}

function RuntimeLabSession({
  mediaFixtureId,
}: {
  mediaFixtureId: RuntimeMediaFixtureId
}) {
  const { completeMedia, feedback, step, submitAnswer } = useLessonStep()
  const session = useLessonSession()
  const adapters = useRuntimeMediaFixture(mediaFixtureId)

  if (!step) return null

  return (
    <LessonFrame>
      <RuntimeLabStep
        audioAdapter={adapters.audio}
        disabled={Boolean(feedback)}
        isLessonComplete={session?.status === 'completed'}
        isStepReady={step.session.isReady}
        mediaFixtureId={mediaFixtureId}
        onCompleteMedia={(mediaId) =>
          completeMedia({
            mediaId,
            feedback: {
              title: 'Ready to continue',
              message: 'The media step has been completed.',
            },
          })
        }
        onSubmitAnswer={submitAnswer}
        recordingAdapter={adapters.recording}
        stepId={step.definition.id}
      />
    </LessonFrame>
  )
}

function RuntimeLabStep({
  audioAdapter,
  disabled,
  isLessonComplete,
  isStepReady,
  mediaFixtureId,
  onCompleteMedia,
  onSubmitAnswer,
  recordingAdapter,
  stepId,
}: {
  audioAdapter: ReturnType<typeof useRuntimeMediaFixture>['audio']
  disabled: boolean
  isLessonComplete: boolean
  isStepReady: boolean
  mediaFixtureId: RuntimeMediaFixtureId
  onCompleteMedia: (mediaId: string) => void
  onSubmitAnswer: ReturnType<typeof useLessonStep>['submitAnswer']
  recordingAdapter: ReturnType<typeof useRuntimeMediaFixture>['recording']
  stepId: string
}) {
  switch (stepId) {
    case 'runtime-welcome':
      return (
        <div className="flex max-w-md flex-col items-center gap-5 text-center">
          <span className="flex size-20 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary-shadow">
            <SparklesIcon className="size-9" />
          </span>
          <p className="leading-7 text-muted-foreground">
            Work through one decision at a time. Progress only moves when the
            current task is ready.
          </p>
          <DevRuntimeScenarioSwitcher fixtureId={mediaFixtureId} />
        </div>
      )
    case 'runtime-choice':
      return (
        <ChoiceInteraction
          disabled={disabled}
          onSubmit={(result) =>
            onSubmitAnswer({
              interactionId: 'runtime-choice-feedback',
              answer: result.selectedId,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Good decision',
                message: 'Feedback is most useful before the next attempt.',
              },
              incorrectFeedback: {
                title: 'Use the result first',
                message: 'Look for the option that changes the next attempt.',
              },
            })
          }
          options={runtimeChoiceOptions}
          prompt="What should happen after an incorrect answer?"
        />
      )
    case 'runtime-order':
      return (
        <OrderingInteraction
          disabled={disabled}
          items={runtimeOrderingItems}
          onSubmit={(result) =>
            onSubmitAnswer({
              interactionId: 'runtime-order-rhythm',
              answer: result.itemIds,
              isCorrect: result.isCorrect,
              correctFeedback: {
                title: 'Sequence complete',
                message: 'Listen, notice, respond, then review.',
              },
              incorrectFeedback: {
                title: 'Check the learning rhythm',
                message: 'Begin with input and finish by reviewing the result.',
              },
            })
          }
          prompt="Arrange the learning rhythm"
        />
      )
    case 'runtime-audio':
      return (
        <AudioControl
          adapter={audioAdapter}
          completed={isStepReady}
          label="Short listening cue"
          mediaId="runtime-audio-cue"
          onComplete={onCompleteMedia}
        />
      )
    case 'runtime-recording':
      return (
        <RecordingControl
          adapter={recordingAdapter}
          completed={isStepReady}
          label="Short spoken response"
          mediaId="runtime-recording-cue"
          onComplete={onCompleteMedia}
        />
      )
    default:
      return (
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <CheckCircle2Icon className="size-16 text-progress" />
          <Badge variant="secondary">
            {isLessonComplete ? '6 shared steps complete' : 'Ready to finish'}
          </Badge>
          <p className="leading-7 text-muted-foreground">
            The session kept every attempt and emitted one completion event.
          </p>
        </div>
      )
  }
}
