'use client'

/* eslint-disable react-hooks/refs -- dnd-timeline exposes render styles and ref setters from hooks. */

import { useMemo } from 'react'
import { Eye, SlidersHorizontal, Volume2 } from 'lucide-react'
import {
  TimelineContext,
  type DragEndEvent,
  type Range,
  type ResizeEndEvent,
  useItem,
  useRow,
  useTimelineContext,
} from 'dnd-timeline/dist/index.mjs'

import { cn } from '@/lib/utils'
import type { SceneAction } from '../scene-schema/action-schema'
import type { MockAsset } from '../scene-schema/project-schema'
import type { SceneData } from '../scene-schema/scene-schema'
import type { TimelineStep } from '../scene-schema/timeline-schema'
import {
  getClipDuration,
  minimumTimelineClipDuration,
} from '../scene-schema/timeline-utils'

const SIDEBAR_WIDTH = 96

const tracks = [
  { id: 'visual', label: 'Visual', Icon: Eye },
  { id: 'audio', label: 'Audio', Icon: Volume2 },
  { id: 'control', label: 'Control', Icon: SlidersHorizontal },
] as const

type TrackId = (typeof tracks)[number]['id']

type TimelineCanvasProps = {
  scene: SceneData
  assets: MockAsset[]
  locale: string
  range: Range
  selectedStepId: string | null
  playheadMs: number
  onRangeChange: React.Dispatch<React.SetStateAction<Range>>
  onPlayheadChange: (playheadMs: number) => void
  onSelectStep: (stepId: string) => void
  onMoveStep: (stepId: string, start: number) => void
  onResizeStep: (stepId: string, start: number, duration: number) => void
}

type TimelineClip = {
  step: TimelineStep
  action: SceneAction | undefined
  label: string
  trackId: TrackId
  span: Range
  resizable: boolean
}

export function TimelineCanvas({
  scene,
  assets,
  locale,
  range,
  selectedStepId,
  playheadMs,
  onRangeChange,
  onPlayheadChange,
  onSelectStep,
  onMoveStep,
  onResizeStep,
}: TimelineCanvasProps) {
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  )
  const clips = scene.timeline.map((step, index) => {
    const action = scene.actions.find((candidate) => candidate.id === step.actionId)
    const duration = getClipDuration(step, action, assetsById)

    return {
      step,
      action,
      label: getClipLabel(step, action, locale, index),
      trackId: getTrackId(action?.kind),
      span: { start: step.at, end: step.at + duration },
      resizable: isResizable(action?.kind),
    } satisfies TimelineClip
  })

  function handleDragEnd(event: DragEndEvent) {
    const nextSpan = event.active.data.current?.getSpanFromDragEvent?.(event)
    if (!nextSpan) return
    onMoveStep(String(event.active.id), Math.max(0, Math.round(nextSpan.start)))
  }

  function handleResizeEnd(event: ResizeEndEvent) {
    const nextSpan = event.active.data.current.getSpanFromResizeEvent?.(event)
    if (!nextSpan) return

    const start = Math.max(0, Math.round(nextSpan.start))
    const end = Math.max(
      start + minimumTimelineClipDuration,
      Math.round(nextSpan.end),
    )
    onResizeStep(String(event.active.id), start, end - start)
  }

  return (
    <TimelineContext
      range={range}
      onRangeChanged={(update) =>
        onRangeChange((current) => normalizeVisibleRange(update(current)))
      }
      onDragEnd={handleDragEnd}
      onResizeEnd={handleResizeEnd}
      rangeGridSizeDefinition={[
        { value: 50, maxRangeSize: 4_000 },
        { value: 100, maxRangeSize: 10_000 },
        { value: 250 },
      ]}
      resizeHandleWidth={18}
      sidebarWidth={SIDEBAR_WIDTH}
      useResizeAnimation
    >
      <TimelineSurface
        clips={clips}
        selectedStepId={selectedStepId}
        playheadMs={playheadMs}
        onSelectStep={onSelectStep}
        onPlayheadChange={onPlayheadChange}
      />
    </TimelineContext>
  )
}

function TimelineSurface({
  clips,
  selectedStepId,
  playheadMs,
  onSelectStep,
  onPlayheadChange,
}: {
  clips: TimelineClip[]
  selectedStepId: string | null
  playheadMs: number
  onSelectStep: (stepId: string) => void
  onPlayheadChange: (playheadMs: number) => void
}) {
  const timeline = useTimelineContext()

  return (
    <div
      ref={timeline.setTimelineRef}
      style={timeline.style}
      className="relative h-44 min-w-0 shrink-0 overflow-hidden bg-background"
      data-testid="timeline-canvas"
      data-playhead-ms={Math.round(playheadMs)}
    >
      <TimelineRuler
        playheadMs={playheadMs}
        onPlayheadChange={onPlayheadChange}
      />
      <div className="relative">
        {tracks.map((track) => (
          <TimelineTrack
            key={track.id}
            track={track}
            clips={clips.filter((clip) => clip.trackId === track.id)}
            selectedStepId={selectedStepId}
            onSelectStep={onSelectStep}
          />
        ))}
        <PlayheadLine playheadMs={playheadMs} />
      </div>
    </div>
  )
}

function TimelineRuler({
  playheadMs,
  onPlayheadChange,
}: {
  playheadMs: number
  onPlayheadChange: (playheadMs: number) => void
}) {
  const timeline = useTimelineContext()
  const ticks = createTicks(timeline.range)

  return (
    <div className="flex h-8 border-b border-border bg-muted/35">
      <div
        className="relative z-20 flex shrink-0 items-center border-r border-border bg-muted/60 px-3 text-[10px] font-medium text-muted-foreground"
        style={{ width: timeline.sidebarWidth }}
      >
        Tracks
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden" aria-label="Timeline ruler">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute inset-y-0 border-l border-border/70"
            style={{ left: timeline.valueToPixels(tick - timeline.range.start) }}
          >
            <span className="absolute left-1 top-1 text-[9px] tabular-nums text-muted-foreground">
              {formatAxisTime(tick)}
            </span>
          </div>
        ))}
        <PlayheadHandle
          playheadMs={playheadMs}
          onPlayheadChange={onPlayheadChange}
        />
      </div>
    </div>
  )
}

function TimelineTrack({
  track,
  clips,
  selectedStepId,
  onSelectStep,
}: {
  track: (typeof tracks)[number]
  clips: TimelineClip[]
  selectedStepId: string | null
  onSelectStep: (stepId: string) => void
}) {
  const row = useRow({ id: track.id })

  return (
    <div
      ref={row.setNodeRef}
      style={row.rowWrapperStyle}
      className={cn(
        'h-12 w-full border-b border-border last:border-b-0',
        row.isOver && 'bg-accent/40',
      )}
    >
      <div
        style={row.rowSidebarStyle}
        className="relative z-20 shrink-0 items-center gap-2 border-r border-border bg-card px-3"
      >
        <track.Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-[11px] font-medium">{track.label}</span>
      </div>
      <div
        style={row.rowStyle}
        className="min-w-0 bg-muted/10"
      >
        {clips.map((clip) => (
          <TimelineItem
            key={clip.step.id}
            clip={clip}
            selected={clip.step.id === selectedStepId}
            onSelect={() => onSelectStep(clip.step.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({
  clip,
  selected,
  onSelect,
}: {
  clip: TimelineClip
  selected: boolean
  onSelect: () => void
}) {
  const item = useItem({
    id: clip.step.id,
    span: clip.span,
    data: { trackId: clip.trackId },
    resizeHandleWidth: clip.resizable ? 18 : 0,
  })

  return (
    <button
      ref={item.setNodeRef}
      type="button"
      style={item.itemStyle}
      className={cn(
        'group z-10 my-1 h-10 overflow-hidden rounded-md border px-0 text-left text-[11px] outline-none transition-[box-shadow,filter] focus-visible:ring-2 focus-visible:ring-ring',
        clip.trackId === 'visual' &&
          'border-border bg-secondary text-secondary-foreground hover:brightness-95',
        clip.trackId === 'audio' &&
          'border-primary/50 bg-primary text-primary-foreground hover:brightness-110',
        clip.trackId === 'control' &&
          'border-foreground/20 bg-muted text-foreground hover:bg-accent',
        selected && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
        item.isDragging && 'z-30 opacity-80 shadow-lg',
      )}
      data-testid={`timeline-item-${clip.step.id}`}
      onClick={onSelect}
      {...item.attributes}
      {...item.listeners}
      aria-pressed={selected}
      aria-label={`${clip.label}, starts at ${formatTimestamp(clip.step.at)}`}
    >
      <span style={item.itemContentStyle}>
        {clip.resizable ? (
          <span className="w-1.5 shrink-0 cursor-col-resize border-r border-current/20 opacity-50" />
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-1.5 px-2">
          <span className="truncate font-medium">{clip.label}</span>
          <span className="ml-auto shrink-0 tabular-nums opacity-70">
            {formatCompactDuration(clip.span.end - clip.span.start)}
          </span>
        </span>
        {clip.resizable ? (
          <span className="w-1.5 shrink-0 cursor-col-resize border-l border-current/20 opacity-50" />
        ) : null}
      </span>
    </button>
  )
}

function PlayheadHandle({
  playheadMs,
  onPlayheadChange,
}: {
  playheadMs: number
  onPlayheadChange: (playheadMs: number) => void
}) {
  const timeline = useTimelineContext()
  const position = timeline.valueToPixels(
    clampToRange(playheadMs, timeline.range) - timeline.range.start,
  )

  return (
    <div
      className="absolute inset-y-0 left-0 right-0 cursor-col-resize"
      data-testid="timeline-ruler-scrubber"
      onPointerDown={(event) => {
        setPlayhead(timeline, event.clientX, onPlayheadChange)

        function handlePointerMove(moveEvent: PointerEvent) {
          setPlayhead(timeline, moveEvent.clientX, onPlayheadChange)
        }

        function handlePointerUp() {
          window.removeEventListener('pointermove', handlePointerMove)
          window.removeEventListener('pointerup', handlePointerUp)
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp, { once: true })
      }}
    >
      <span
        className="pointer-events-none absolute top-0 h-2.5 w-px bg-destructive"
        style={{ left: position }}
        aria-hidden="true"
      />
    </div>
  )
}

function PlayheadLine({ playheadMs }: { playheadMs: number }) {
  const timeline = useTimelineContext()
  const position = timeline.valueToPixels(
    clampToRange(playheadMs, timeline.range) - timeline.range.start,
  )

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-40 w-px bg-destructive"
      style={{ left: SIDEBAR_WIDTH + position }}
      aria-hidden="true"
    >
      <span className="absolute -left-1.5 -top-1 size-3 rotate-45 rounded-[2px] bg-destructive" />
    </div>
  )
}

function setPlayhead(
  timeline: ReturnType<typeof useTimelineContext>,
  clientX: number,
  onPlayheadChange: (playheadMs: number) => void,
) {
  const value = Math.max(
    timeline.range.start,
    Math.min(timeline.range.end, timeline.getValueFromScreenX(clientX)),
  )
  onPlayheadChange(Math.round(value))
}

function clampToRange(value: number, range: Range) {
  return Math.max(range.start, Math.min(range.end, value))
}

function getTrackId(kind?: SceneAction['kind']): TrackId {
  if (kind === 'playAudio' || kind === 'speak') return 'audio'
  if (
    kind === 'pause' ||
    kind === 'wait' ||
    kind === 'pauseUntilInteraction' ||
    kind === 'setState' ||
    kind === 'emitLearningEvent'
  ) {
    return 'control'
  }
  return 'visual'
}

function isResizable(kind?: SceneAction['kind']) {
  return (
    kind === 'highlight' ||
    kind === 'playAudio' ||
    kind === 'speak' ||
    kind === 'wait' ||
    kind === 'move' ||
    kind === 'animate'
  )
}

function getClipLabel(
  step: TimelineStep,
  action: SceneAction | undefined,
  locale: string,
  index: number,
) {
  const localizedLabel = step.label
    ? step.label[locale] ??
      step.label.en ??
      step.label.zhHans ??
      Object.values(step.label)[0]
    : undefined

  return localizedLabel || action?.label || getActionLabel(action?.kind) || `Cue ${index + 1}`
}

function getActionLabel(kind?: SceneAction['kind']) {
  switch (kind) {
    case 'show': return 'Show'
    case 'hide': return 'Hide'
    case 'highlight': return 'Highlight'
    case 'playAudio': return 'Play audio'
    case 'speak': return 'Mascot speaks'
    case 'pause': return 'Pause'
    case 'wait': return 'Wait'
    case 'pauseUntilInteraction': return 'Wait for answer'
    case 'setState': return 'Set state'
    case 'emitLearningEvent': return 'Learning event'
    case 'move': return 'Move'
    case 'animate': return 'Animate'
    default: return undefined
  }
}

function createTicks(range: Range) {
  const span = range.end - range.start
  const targetInterval = span / 7
  const intervals = [100, 250, 500, 1_000, 2_000, 5_000, 10_000]
  const interval = intervals.find((candidate) => candidate >= targetInterval) ?? 10_000
  const first = Math.ceil(range.start / interval) * interval
  const result: number[] = []
  for (let value = first; value <= range.end; value += interval) result.push(value)
  return result
}

function normalizeVisibleRange(range: Range): Range {
  const duration = Math.min(60_000, Math.max(1_000, range.end - range.start))
  const start = Math.max(0, Math.min(range.start, 60_000 - duration))
  return { start, end: start + duration }
}

function formatAxisTime(milliseconds: number) {
  const seconds = milliseconds / 1000
  return seconds >= 10 ? `${seconds.toFixed(0)}s` : `${seconds.toFixed(1)}s`
}

function formatCompactDuration(milliseconds: number) {
  return milliseconds >= 1_000
    ? `${(milliseconds / 1_000).toFixed(milliseconds % 1_000 === 0 ? 0 : 1)}s`
    : `${milliseconds}ms`
}

function formatTimestamp(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60_000)
  const seconds = Math.floor((milliseconds % 60_000) / 1000)
  const remainder = milliseconds % 1000
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(remainder).padStart(3, '0')}`
}
