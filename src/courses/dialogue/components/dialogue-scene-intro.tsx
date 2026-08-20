import { MapPinIcon, MessageCircleMoreIcon, TargetIcon } from 'lucide-react'

import type { DialogueLessonStep } from '../model/dialogue-lesson-schema'

type SceneIntroStep = Extract<DialogueLessonStep, { kind: 'scene-intro' }>

export function DialogueSceneIntro({ step }: { step: SceneIntroStep }) {
  return (
    <section className="w-full border-y py-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-focus">
        <MapPinIcon className="size-4" />
        <span>{step.sceneLabel}</span>
      </div>
      <p className="mt-5 text-xl leading-8 text-balance">{step.setting}</p>
      <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent text-focus">
          <TargetIcon className="size-5" />
        </span>
        <div>
          <p className="font-semibold">Your role in this scene</p>
          <p className="mt-1 leading-7 text-muted-foreground">{step.goal}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircleMoreIcon className="size-4" />
        <span>The exchange uses original HSKWise course content.</span>
      </div>
    </section>
  )
}
