import type { CSSProperties } from 'react'
import { MousePointerClick, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SceneAction } from '@/features/course-studio/scene-schema/action-schema'
import type { SceneElement } from '@/features/course-studio/scene-schema/element-schema'
import type { SceneInteraction } from '@/features/course-studio/scene-schema/interaction-schema'
import type { MockAsset } from '@/features/course-studio/scene-schema/project-schema'
import type { InteractionAttempt } from '@/features/course-studio/scene-schema/runtime-schema'
import type {
  JsonValue,
  LocalizedText,
} from '@/features/course-studio/scene-schema/shared'
import { InteractionRenderer } from './interaction-renderer'

type ElementRendererProps = {
  element: SceneElement
  locale: string
  highlightEffect: Extract<SceneAction, { kind: 'highlight' }>['effect'] | null
  runtimeVisual?: ElementRuntimeVisual
  interactionsById: Map<string, SceneInteraction>
  interactionAttempts: Map<string, InteractionAttempt>
  assetsById: Map<string, MockAsset>
  onRunActions: (actionIds: string[]) => void
  onSubmitInteraction: (
    interactionId: string,
    isCorrect?: boolean | null,
    answer?: JsonValue,
  ) => void
}

export type ElementRuntimeVisual = {
  position?: Extract<SceneAction, { kind: 'move' }>['to']
  move?: {
    durationMs: number
    easing: Extract<SceneAction, { kind: 'move' }>['easing']
    token: number
  }
  animation?: {
    kind: Extract<SceneAction, { kind: 'animate' }>['animation']
    durationMs: number
    elapsedMs?: number
    paused?: boolean
    token: number
  }
}

export function ElementRenderer({
  element,
  locale,
  highlightEffect,
  runtimeVisual,
  interactionsById,
  interactionAttempts,
  assetsById,
  onRunActions,
  onSubmitInteraction,
}: ElementRendererProps) {
  return (
    <div
      className={cn(
        'absolute flex min-h-0 min-w-0 transition-all',
        getHighlightClass(highlightEffect),
      )}
      style={getPositionStyle(element, runtimeVisual)}
    >
      {renderElementContent({
        element,
        locale,
        interactionsById,
        interactionAttempts,
        assetsById,
        onRunActions,
        onSubmitInteraction,
      })}
    </div>
  )
}

function renderElementContent({
  element,
  locale,
  interactionsById,
  interactionAttempts,
  assetsById,
  onRunActions,
  onSubmitInteraction,
}: Omit<ElementRendererProps, 'highlightEffect' | 'runtimeVisual'>) {
  switch (element.kind) {
    case 'text':
      return (
        <div className="flex size-full items-center justify-center rounded-lg bg-card/90 p-4 text-card-foreground shadow-sm">
          <p className={cn('text-center leading-snug', getTextSizeClass(element.style?.size))}>
            {readText(element.content, locale)}
          </p>
        </div>
      )

    case 'callout':
      return (
        <div className="flex size-full items-center rounded-lg border border-border bg-card/95 p-4 text-card-foreground shadow-sm">
          <p className="text-sm leading-relaxed">{readText(element.content, locale)}</p>
        </div>
      )

    case 'mascot':
      return (
        <div className="flex size-full min-h-24 min-w-24 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold">
              Panda
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {element.expression}
            </span>
          </div>
        </div>
      )

    case 'pinyinChart':
      return (
        <div className="grid size-full min-h-48 grid-cols-4 items-end gap-3 rounded-lg border border-border bg-card/95 p-5 shadow-sm">
          {['tone_1', 'tone_2', 'tone_3', 'tone_4'].map((toneKey, index) => (
            <div key={toneKey} className="flex h-full flex-col items-center justify-end gap-2">
              <div
                className={cn(
                  'w-full rounded-md border-2 border-border bg-secondary',
                  element.highlightKeys.includes(toneKey) ? 'border-primary bg-primary/10' : '',
                )}
                style={{ height: `${[70, 45, 35, 60][index]}%` }}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Tone {index + 1}
              </span>
            </div>
          ))}
        </div>
      )

    case 'dialogue':
      return (
        <div className="flex size-full flex-col gap-3 rounded-lg border border-border bg-card/95 p-4 shadow-sm">
          {element.scene ? (
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              {readText(element.scene, locale)}
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            {element.lines.map((line) => (
              <div key={line.id} className="rounded-md bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {line.speakerName ?? line.speakerKey}
                </p>
                <p className="text-lg font-semibold">{line.hanzi}</p>
                {line.pinyin ? <p className="text-sm text-muted-foreground">{line.pinyin}</p> : null}
                {line.translation ? (
                  <p className="text-sm text-muted-foreground">{line.translation}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )

    case 'vocabulary':
      return (
        <div className="flex size-full flex-col gap-3 rounded-lg border border-border bg-card/95 p-4 shadow-sm">
          {element.title ? (
            <p className="text-sm font-semibold">{readText(element.title, locale)}</p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-3">
            {element.items.map((item) => (
              <div key={item.id} className="rounded-md bg-background p-3">
                <p className="text-lg font-semibold">{item.simplified}</p>
                {item.displayPinyin ? (
                  <p className="text-sm text-muted-foreground">{item.displayPinyin}</p>
                ) : null}
                {item.displayMeaning ? (
                  <p className="text-sm text-muted-foreground">{item.displayMeaning}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )

    case 'quiz': {
      const interaction = interactionsById.get(element.interactionId)

      if (!interaction) {
        return <MissingReference label={`interaction ${element.interactionId}`} />
      }

      return (
        <InteractionRenderer
          interaction={interaction}
          locale={locale}
          attempt={interactionAttempts.get(interaction.id)}
          assetsById={assetsById}
          onSubmit={onSubmitInteraction}
        />
      )
    }

    case 'button':
      return (
        <Button className="self-center" onClick={() => onRunActions(element.actionIds)}>
          <MousePointerClick data-icon="inline-start" />
          {readText(element.label, locale)}
        </Button>
      )

    case 'hotspot':
      return (
        <button
          type="button"
          className="flex size-full items-center justify-center rounded-lg border border-dashed border-border bg-card/80 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          onClick={() => onRunActions(element.actionIds)}
        >
          {element.label ? readText(element.label, locale) : 'Hotspot'}
        </button>
      )

    case 'panel':
    case 'group':
      return (
        <div className="flex size-full items-center justify-center rounded-lg border border-border bg-card/80 p-4 text-sm text-muted-foreground">
          {element.kind}
        </div>
      )

    case 'image':
    case 'video':
    case 'audio': {
      const asset = element.assetId ? assetsById.get(element.assetId) : null
      return (
        <div className="flex size-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card/80 p-4 text-center">
          <PlayCircle className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">{asset ? readText(asset.label, locale) : element.kind}</p>
          <p className="text-xs text-muted-foreground">
            {asset?.status ?? (element.url ? 'remote URL' : 'missing')}
          </p>
        </div>
      )
    }
  }
}

function MissingReference({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      Missing {label}
    </div>
  )
}

function getPositionStyle(
  element: SceneElement,
  runtimeVisual?: ElementRuntimeVisual,
): CSSProperties {
  const position = runtimeVisual?.position ?? element.position
  const style: CSSProperties = {
    zIndex: position?.zIndex,
    transitionDuration: runtimeVisual?.move
      ? `${runtimeVisual.move.durationMs}ms`
      : undefined,
    transitionTimingFunction: runtimeVisual?.move
      ? getMoveEasing(runtimeVisual.move.easing)
      : undefined,
    ...getAnimationStyle(runtimeVisual?.animation),
  }

  if (position?.x !== undefined) {
    style.left = `${position.x * 100}%`
  }

  if (position?.y !== undefined) {
    style.top = `${position.y * 100}%`
  }

  if (position?.width !== undefined) {
    style.width = `${position.width * 100}%`
  }

  if (position?.height !== undefined) {
    style.height = `${position.height * 100}%`
  }

  if (position?.x !== undefined || position?.y !== undefined) {
    return {
      ...style,
      transform: 'translate(-50%, -50%)',
    }
  }

  return {
    ...style,
    ...getPresetStyle(position?.preset),
  }
}

function getHighlightClass(
  effect: Extract<SceneAction, { kind: 'highlight' }>['effect'] | null,
) {
  switch (effect) {
    case 'pulse':
      return 'animate-pulse ring-3 ring-ring/50'
    case 'glow':
      return 'ring-3 ring-ring/50 shadow-xl'
    case 'underline':
      return 'border-b-4 border-primary'
    case 'outline':
      return 'ring-3 ring-ring/60'
    default:
      return ''
  }
}

function getMoveEasing(
  easing: Extract<SceneAction, { kind: 'move' }>['easing'],
) {
  switch (easing) {
    case 'linear':
      return 'linear'
    case 'easeIn':
      return 'cubic-bezier(0.4, 0, 1, 1)'
    case 'easeInOut':
      return 'cubic-bezier(0.4, 0, 0.2, 1)'
    case 'easeOut':
    default:
      return 'cubic-bezier(0, 0, 0.2, 1)'
  }
}

function getAnimationStyle(
  animation: ElementRuntimeVisual['animation'] | undefined,
): CSSProperties {
  if (!animation) return {}

  return {
    animationName: `course-studio-${animation.kind}`,
    animationDuration: `${animation.durationMs}ms`,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'both',
    animationDelay: animation.elapsedMs
      ? `${-animation.elapsedMs}ms`
      : undefined,
    animationPlayState: animation.paused ? 'paused' : 'running',
  }
}

function getPresetStyle(preset?: string): CSSProperties {
  switch (preset) {
    case 'top':
      return { inset: '6% 16% auto 16%', minHeight: '14%' }
    case 'bottom':
      return { inset: 'auto 14% 6% 14%', minHeight: '18%' }
    case 'left':
      return { inset: '14% auto 14% 6%', width: '34%' }
    case 'right':
      return { inset: '14% 6% 14% auto', width: '34%' }
    case 'left-top':
      return { left: '6%', top: '6%', width: '28%', minHeight: '22%' }
    case 'right-top':
      return { right: '6%', top: '6%', width: '28%', minHeight: '22%' }
    case 'left-bottom':
      return { left: '6%', bottom: '6%', width: '28%', minHeight: '22%' }
    case 'right-bottom':
      return { right: '6%', bottom: '6%', width: '18%', minHeight: '18%' }
    case 'full':
      return { inset: '0' }
    case 'center':
    default:
      return { inset: '18% 12% 18% 12%' }
  }
}

function getTextSizeClass(size?: string) {
  switch (size) {
    case 'sm':
      return 'text-sm'
    case 'lg':
      return 'text-xl'
    case 'xl':
      return 'text-2xl'
    case 'display':
      return 'text-3xl'
    case 'md':
    default:
      return 'text-base'
  }
}

function readText(value: LocalizedText, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}
