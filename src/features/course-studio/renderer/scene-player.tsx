'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Play, RotateCcw, StepForward } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { SceneAction } from '@/features/course-studio/scene-schema/action-schema'
import type { MockAsset } from '@/features/course-studio/scene-schema/project-schema'
import type { SceneData } from '@/features/course-studio/scene-schema/scene-schema'
import type { SceneEvent } from '@/features/course-studio/scene-schema/timeline-schema'
import { ElementRenderer } from './element-renderer'

type ScenePlayerProps = {
  scene: SceneData
  title?: string
  locale?: string
  assets?: MockAsset[]
}

type PlayerLog = {
  id: string
  kind: string
  message: string
}

type RuntimeRefs = {
  elementIds: Set<string>
  interactionIds: Set<string>
  actionIds: Set<string>
}

export function ScenePlayer({
  scene,
  title,
  locale = 'en',
  assets = [],
}: ScenePlayerProps) {
  const timersRef = useRef<number[]>([])
  const [visibleElementIds, setVisibleElementIds] = useState<string[]>(() =>
    getInitialVisibleElementIds(scene)
  )
  const [highlightedElementId, setHighlightedElementId] = useState<
    string | null
  >(null)
  const [timelineCursor, setTimelineCursor] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [runtimeState, setRuntimeState] = useState<Record<string, unknown>>(
    scene.state
  )
  const [completedInteractionIds, setCompletedInteractionIds] = useState<
    string[]
  >([])
  const [correctInteractionIds, setCorrectInteractionIds] = useState<string[]>(
    []
  )
  const [logs, setLogs] = useState<PlayerLog[]>([])

  const sortedTimeline = useMemo(
    () => [...scene.timeline].sort((a, b) => a.at - b.at),
    [scene.timeline]
  )

  const actionMap = useMemo(
    () => new Map(scene.actions.map(action => [action.id, action])),
    [scene.actions]
  )

  const interactionsById = useMemo(
    () =>
      new Map(
        scene.interactions.map(interaction => [interaction.id, interaction])
      ),
    [scene.interactions]
  )

  const assetsById = useMemo(
    () => new Map(assets.map(asset => [asset.id, asset])),
    [assets]
  )

  const runtimeRefs = useMemo<RuntimeRefs>(
    () => ({
      elementIds: new Set(scene.elements.map(element => element.id)),
      interactionIds: new Set(
        scene.interactions.map(interaction => interaction.id)
      ),
      actionIds: new Set(scene.actions.map(action => action.id)),
    }),
    [scene.actions, scene.elements, scene.interactions]
  )

  const visibleSet = useMemo(
    () => new Set(visibleElementIds),
    [visibleElementIds]
  )
  const completedSet = useMemo(
    () => new Set(completedInteractionIds),
    [completedInteractionIds]
  )
  const correctSet = useMemo(
    () => new Set(correctInteractionIds),
    [correctInteractionIds]
  )

  const isComplete = useMemo(
    () => getSceneComplete(scene, completedSet, correctSet),
    [completedSet, correctSet, scene]
  )

  const appendLog = useCallback((kind: string, message: string) => {
    setLogs(current =>
      [
        {
          id: `${Date.now()}_${current.length}`,
          kind,
          message,
        },
        ...current,
      ].slice(0, 12)
    )
  }, [])

  const executeAction = useCallback(
    (action: SceneAction) => {
      switch (action.kind) {
        case 'show':
          setVisibleElementIds(current =>
            current.includes(action.targetId)
              ? current
              : [...current, action.targetId]
          )
          appendLog('action.show', `Show ${action.targetId}`)
          break

        case 'hide':
          setVisibleElementIds(current =>
            current.filter(elementId => elementId !== action.targetId)
          )
          appendLog('action.hide', `Hide ${action.targetId}`)
          break

        case 'highlight':
          setHighlightedElementId(action.targetId)
          appendLog('action.highlight', `Highlight ${action.targetId}`)
          timersRef.current.push(
            window.setTimeout(
              () => setHighlightedElementId(null),
              action.durationMs ?? 900
            )
          )
          break

        case 'playAudio':
          appendLog(
            'action.playAudio',
            action.assetId
              ? `Play audio ${action.assetId}`
              : action.url
                ? `Play remote audio`
                : 'Audio missing'
          )
          break

        case 'speak':
          appendLog('action.speak', readText(action.text, locale))
          break

        case 'pause':
          setIsPlaying(false)
          appendLog('action.pause', 'Timeline paused')
          break

        case 'wait':
          appendLog('action.wait', `Wait ${action.durationMs}ms`)
          break

        case 'pauseUntilInteraction':
          appendLog(
            'action.pauseUntilInteraction',
            `Waiting for ${action.interactionId}`
          )
          break

        case 'setState':
          setRuntimeState(current =>
            setRuntimePath(current, action.path, action.value)
          )
          appendLog('action.setState', `Set ${action.path}`)
          break

        case 'emitLearningEvent':
          appendLog('learningEvent', action.eventName)
          break

        case 'move':
        case 'animate':
          appendLog(
            `action.${action.kind}`,
            `${action.kind} ${action.targetId}`
          )
          break
      }
    },
    [appendLog, locale]
  )

  const runActions = useCallback(
    (actionIds: string[]) => {
      actionIds.forEach(actionId => {
        const action = actionMap.get(actionId)
        if (!action) {
          appendLog('missing.action', `Missing action ${actionId}`)
          return
        }
        executeAction(action)
      })
    },
    [actionMap, appendLog, executeAction]
  )

  const runEvents = useCallback(
    (
      trigger: SceneEvent['on'],
      targetId: string | undefined,
      payload: Record<string, unknown> = {}
    ) => {
      scene.events.forEach(event => {
        if (event.on !== trigger) {
          return
        }

        if (event.targetId && targetId && event.targetId !== targetId) {
          return
        }

        if (event.when && !evaluateCondition(event.when, payload)) {
          return
        }

        runActions(event.actions)
      })
    },
    [runActions, scene.events]
  )

  const submitInteraction = useCallback(
    (interactionId: string, isCorrect = true) => {
      setCompletedInteractionIds(current =>
        current.includes(interactionId) ? current : [...current, interactionId]
      )

      if (isCorrect) {
        setCorrectInteractionIds(current =>
          current.includes(interactionId)
            ? current
            : [...current, interactionId]
        )
      }

      appendLog(
        isCorrect ? 'interaction.correct' : 'interaction.incorrect',
        `${interactionId} submitted`
      )
      runEvents('interaction.submit', interactionId, { isCorrect })
      runEvents(
        isCorrect ? 'interaction.correct' : 'interaction.incorrect',
        interactionId,
        {
          isCorrect,
        }
      )
    },
    [appendLog, runEvents]
  )

  const resetPlayer = useCallback(() => {
    timersRef.current.forEach(timerId => window.clearTimeout(timerId))
    timersRef.current = []
    setVisibleElementIds(getInitialVisibleElementIds(scene))
    setHighlightedElementId(null)
    setTimelineCursor(0)
    setIsPlaying(false)
    setRuntimeState(scene.state)
    setCompletedInteractionIds([])
    setCorrectInteractionIds([])
    setLogs([])
  }, [scene])

  const stepTimeline = useCallback(() => {
    const step = sortedTimeline[timelineCursor]
    if (!step) {
      setIsPlaying(false)
      appendLog('timeline.complete', 'Timeline complete')
      return
    }

    runActions([step.actionId])
    runEvents('timeline.enter', step.id)
    setTimelineCursor(current => current + 1)
  }, [appendLog, runActions, runEvents, sortedTimeline, timelineCursor])

  const playTimeline = useCallback(() => {
    timersRef.current.forEach(timerId => window.clearTimeout(timerId))
    timersRef.current = []
    setIsPlaying(true)

    const remainingSteps = sortedTimeline.slice(timelineCursor)
    if (remainingSteps.length === 0) {
      appendLog('timeline.complete', 'Timeline complete')
      setIsPlaying(false)
      return
    }

    const baseAt = remainingSteps[0]?.at ?? 0
    remainingSteps.forEach((step, index) => {
      const timerId = window.setTimeout(
        () => {
          const action = actionMap.get(step.actionId)
          if (action) {
            executeAction(action)
            runEvents('timeline.enter', step.id)
          }

          setTimelineCursor(timelineCursor + index + 1)
          if (index === remainingSteps.length - 1) {
            setIsPlaying(false)
            appendLog('timeline.complete', 'Timeline complete')
          }
        },
        Math.max(step.at - baseAt, 0)
      )

      timersRef.current.push(timerId)
    })
  }, [
    actionMap,
    appendLog,
    executeAction,
    runEvents,
    sortedTimeline,
    timelineCursor,
  ])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timerId => window.clearTimeout(timerId))
      timersRef.current = []
    }
  }, [])

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Scene Player
          </p>
          <h2 className="truncate text-lg font-semibold">
            {title ?? 'Untitled scene'}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetPlayer}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={stepTimeline}
            disabled={isPlaying}
          >
            <StepForward data-icon="inline-start" />
            Step
          </Button>
          <Button size="sm" onClick={playTimeline} disabled={isPlaying}>
            <Play data-icon="inline-start" />
            {isPlaying ? 'Playing' : 'Play'}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div
            className="relative overflow-hidden rounded-lg border border-border shadow-sm"
            style={{
              aspectRatio: getAspectRatio(scene.canvas.aspectRatio),
              background: getCanvasBackground(scene.canvas.background),
            }}
          >
            {scene.elements.map(element =>
              visibleSet.has(element.id) ? (
                <ElementRenderer
                  key={element.id}
                  element={element}
                  locale={locale}
                  isHighlighted={highlightedElementId === element.id}
                  interactionsById={interactionsById}
                  completedInteractionIds={completedSet}
                  correctInteractionIds={correctSet}
                  assetsById={assetsById}
                  onRunActions={runActions}
                  onSubmitInteraction={submitInteraction}
                />
              ) : null
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Metric
              label="Timeline"
              value={`${timelineCursor}/${sortedTimeline.length}`}
            />
            <Metric
              label="Interactions"
              value={`${completedInteractionIds.length}/${scene.interactions.length}`}
            />
            <Metric label="Complete" value={isComplete ? 'Yes' : 'No'} />
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Runtime
            </p>
            <h3 className="text-sm font-semibold">Scene events</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <Metric
              label="Elements"
              value={String(runtimeRefs.elementIds.size)}
            />
            <Metric
              label="Actions"
              value={String(runtimeRefs.actionIds.size)}
            />
            <Metric label="Events" value={String(scene.events.length)} />
          </div>

          <div className="flex min-h-44 flex-col gap-2 overflow-auto rounded-md bg-background p-2">
            {logs.length > 0 ? (
              logs.map(log => (
                <div
                  key={log.id}
                  className="rounded-md border border-border p-2"
                >
                  <p className="text-xs font-medium">{log.kind}</p>
                  <p className="text-xs text-muted-foreground">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="p-2 text-sm text-muted-foreground">
                Run the timeline or submit an interaction to see events.
              </p>
            )}
          </div>

          <div className="rounded-md bg-background p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
              State
            </p>
            <pre className="max-h-32 overflow-auto text-xs text-muted-foreground">
              {JSON.stringify(runtimeState, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function getInitialVisibleElementIds(scene: SceneData) {
  return scene.elements
    .filter(element => !element.hidden)
    .map(element => element.id)
}

function getSceneComplete(
  scene: SceneData,
  completedInteractionIds: Set<string>,
  correctInteractionIds: Set<string>
) {
  switch (scene.completionRule.kind) {
    case 'manual':
      return false
    case 'viewed':
      return true
    case 'allRequiredInteractions':
      return scene.interactions
        .filter(interaction => interaction.required)
        .every(interaction => completedInteractionIds.has(interaction.id))
    case 'specificInteractions':
      return scene.completionRule.interactionIds.every(interactionId =>
        completedInteractionIds.has(interactionId)
      )
    case 'minCorrect':
      return (
        scene.completionRule.interactionIds.filter(interactionId =>
          correctInteractionIds.has(interactionId)
        ).length >= scene.completionRule.minCorrect
      )
  }
}

function getAspectRatio(value: SceneData['canvas']['aspectRatio']) {
  switch (value) {
    case '4:3':
      return '4 / 3'
    case '1:1':
      return '1 / 1'
    case '9:16':
      return '9 / 16'
    case 'responsive':
      return '16 / 9'
    case '16:9':
    default:
      return '16 / 9'
  }
}

function getCanvasBackground(background: SceneData['canvas']['background']) {
  switch (background.kind) {
    case 'color':
      return background.value
    case 'image':
      return background.url
        ? `center / ${background.fit} no-repeat url("${background.url}")`
        : 'var(--card)'
    case 'gradient':
      return `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`
  }
}

function readText(value: Record<string, string>, locale: string) {
  return (
    value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
  )
}

function setRuntimePath(
  current: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const key = path.replace(/^\$\./, '')
  return {
    ...current,
    [key]: value,
  }
}

function evaluateCondition(
  condition: NonNullable<SceneEvent['when']>,
  payload: Record<string, unknown>
): boolean {
  if ('all' in condition) {
    return condition.all.every(child => evaluateCondition(child, payload))
  }

  if ('any' in condition) {
    return condition.any.some(child => evaluateCondition(child, payload))
  }

  if ('not' in condition) {
    return !evaluateCondition(condition.not, payload)
  }

  const actual = getRuntimePath(payload, condition.path)

  switch (condition.operator) {
    case 'notEquals':
      return actual !== condition.value
    case 'gt':
      return Number(actual) > Number(condition.value)
    case 'gte':
      return Number(actual) >= Number(condition.value)
    case 'lt':
      return Number(actual) < Number(condition.value)
    case 'lte':
      return Number(actual) <= Number(condition.value)
    case 'includes':
      return Array.isArray(actual) ? actual.includes(condition.value) : false
    case 'exists':
      return actual !== undefined
    case 'equals':
    default:
      return actual === condition.value
  }
}

function getRuntimePath(value: Record<string, unknown>, path: string) {
  const key = path.replace(/^\$\./, '')
  return value[key]
}
