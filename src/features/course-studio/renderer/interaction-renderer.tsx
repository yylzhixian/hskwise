import { CheckCircle2, Mic, MousePointerClick, Send, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SceneInteraction } from '@/features/course-studio/scene-schema/interaction-schema'
import type { LocalizedText } from '@/features/course-studio/scene-schema/shared'

type InteractionRendererProps = {
  interaction: SceneInteraction
  locale: string
  isComplete: boolean
  isCorrect: boolean
  onSubmit: (interactionId: string, isCorrect?: boolean) => void
}

export function InteractionRenderer({
  interaction,
  locale,
  isComplete,
  isCorrect,
  onSubmit,
}: InteractionRendererProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {interaction.kind}
          </p>
          {interaction.prompt ? (
            <h3 className="text-sm font-semibold leading-snug">
              {readText(interaction.prompt, locale)}
            </h3>
          ) : null}
        </div>
        <InteractionStatus isComplete={isComplete} isCorrect={isCorrect} />
      </div>

      {renderInteractionBody(interaction, locale, onSubmit)}
    </section>
  )
}

function renderInteractionBody(
  interaction: SceneInteraction,
  locale: string,
  onSubmit: (interactionId: string, isCorrect?: boolean) => void,
) {
  switch (interaction.kind) {
    case 'multipleChoice':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {interaction.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="h-auto min-h-10 justify-start whitespace-normal py-2 text-left"
              onClick={() => onSubmit(interaction.id, option.isCorrect)}
            >
              {option.isCorrect ? <CheckCircle2 data-icon="inline-start" /> : null}
              {readText(option.text, locale)}
            </Button>
          ))}
        </div>
      )

    case 'matching':
      return (
        <div className="flex flex-col gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {interaction.pairs.map((pair) => (
              <div
                key={pair.id}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <span>{readText(pair.source, locale)}</span>
                <span className="text-muted-foreground">=</span>
                <span>{readText(pair.target, locale)}</span>
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
            <Send data-icon="inline-start" />
            Submit match
          </Button>
        </div>
      )

    case 'speechRepeat':
      return (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-lg font-semibold">{interaction.text}</p>
            {interaction.pinyin ? (
              <p className="text-sm text-muted-foreground">{interaction.pinyin}</p>
            ) : null}
          </div>
          <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
            <Mic data-icon="inline-start" />
            Mark recording
          </Button>
        </div>
      )

    case 'rolePlay':
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {interaction.turns.map((turn) => (
              <div
                key={turn.id}
                className={cn(
                  'rounded-md border border-border bg-background px-3 py-2 text-sm',
                  turn.learnerShouldSpeak ? 'bg-secondary' : '',
                )}
              >
                <p className="font-medium">{turn.speakerKey}</p>
                <p>{turn.text}</p>
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
            <Users data-icon="inline-start" />
            Complete role play
          </Button>
        </div>
      )

    case 'hotspot':
    case 'dragDrop':
    case 'swipe':
    case 'ordering':
    case 'cloze':
    case 'dictation':
    case 'shortAnswer':
    case 'boundedChat':
      return (
        <Button variant="secondary" onClick={() => onSubmit(interaction.id, true)}>
          <MousePointerClick data-icon="inline-start" />
          Simulate submit
        </Button>
      )
  }
}

function InteractionStatus({
  isComplete,
  isCorrect,
}: {
  isComplete: boolean
  isCorrect: boolean
}) {
  if (!isComplete) {
    return (
      <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
        Pending
      </span>
    )
  }

  return (
    <span
      className={cn(
        'shrink-0 rounded-md px-2 py-1 text-xs font-medium',
        isCorrect
          ? 'bg-primary text-primary-foreground'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      {isCorrect ? 'Done' : 'Needs review'}
    </span>
  )
}

function readText(value: LocalizedText, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}
