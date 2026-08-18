'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Maximize2,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'
import type { Range } from 'dnd-timeline/dist/index.mjs'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { SceneAction } from '../scene-schema/action-schema'
import type { MockAsset } from '../scene-schema/project-schema'
import type { SceneData } from '../scene-schema/scene-schema'
import type { TimelineStep } from '../scene-schema/timeline-schema'
import { getClipDuration, getTimelineDuration } from '../scene-schema/timeline-utils'
import { createStableId } from './studio-project'

const TimelineCanvas = dynamic(
  () => import('./timeline-canvas').then((module) => module.TimelineCanvas),
  {
    ssr: false,
    loading: () => <div className="h-44 animate-pulse bg-muted/20" />,
  },
)

type TimelinePanelProps = {
  scene: SceneData
  assets: MockAsset[]
  locale: string
  playheadMs: number
  onPlayheadChange: (playheadMs: number) => void
  onChange: (scene: SceneData) => void
}

type EditableActionKind = Extract<
  SceneAction['kind'],
  | 'show'
  | 'hide'
  | 'highlight'
  | 'playAudio'
  | 'speak'
  | 'pause'
  | 'wait'
  | 'pauseUntilInteraction'
  | 'animate'
>

const editableActionKinds: EditableActionKind[] = [
  'show',
  'hide',
  'highlight',
  'playAudio',
  'speak',
  'pause',
  'wait',
  'pauseUntilInteraction',
  'animate',
]

const actionLabels: Record<EditableActionKind, string> = {
  show: 'Show element',
  hide: 'Hide element',
  highlight: 'Highlight element',
  playAudio: 'Play audio',
  speak: 'Mascot speaks',
  pause: 'Pause playback',
  wait: 'Wait',
  pauseUntilInteraction: 'Wait for interaction',
  animate: 'Animate element',
}

export function TimelinePanel({
  scene,
  assets,
  locale,
  playheadMs,
  onPlayheadChange,
  onChange,
}: TimelinePanelProps) {
  const sortedSteps = scene.timeline.toSorted((a, b) => a.at - b.at)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    sortedSteps[0]?.id ?? null,
  )
  const [range, setRange] = useState<Range>(() => ({
    start: 0,
    end: getInitialRangeEnd(scene, assets),
  }))
  const selectedStep =
    sortedSteps.find((step) => step.id === selectedStepId) ?? sortedSteps[0]
  const selectedAction = selectedStep
    ? scene.actions.find((action) => action.id === selectedStep.actionId)
    : undefined
  const selectedIndex = selectedStep
    ? sortedSteps.findIndex((step) => step.id === selectedStep.id)
    : -1
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  )
  const duration = getTimelineDuration(scene, assetsById)

  function updateStep(nextStep: TimelineStep) {
    onChange({
      ...scene,
      timeline: scene.timeline.map((step) =>
        step.id === nextStep.id ? nextStep : step,
      ),
    })
  }

  function updateAction(nextAction: SceneAction) {
    onChange({
      ...scene,
      actions: scene.actions.map((action) =>
        action.id === nextAction.id ? nextAction : action,
      ),
    })
  }

  function moveCueTo(stepId: string, start: number) {
    const step = scene.timeline.find((candidate) => candidate.id === stepId)
    if (!step) return
    const action = scene.actions.find((candidate) => candidate.id === step.actionId)
    updateStep({ ...step, at: start })
    setSelectedStepId(stepId)
    revealTime(start + getClipDuration(step, action, assetsById))
  }

  function resizeCue(stepId: string, start: number, durationMs: number) {
    const step = scene.timeline.find((candidate) => candidate.id === stepId)
    if (!step) return
    const action = scene.actions.find((candidate) => candidate.id === step.actionId)
    const nextAction = action ? updateActionDuration(action, durationMs) : undefined

    onChange({
      ...scene,
      timeline: scene.timeline.map((candidate) =>
        candidate.id === stepId
          ? { ...candidate, at: start, durationMs }
          : candidate,
      ),
      actions: nextAction
        ? scene.actions.map((candidate) =>
            candidate.id === nextAction.id ? nextAction : candidate,
          )
        : scene.actions,
    })
    setSelectedStepId(stepId)
    revealTime(start + durationMs)
  }

  function revealTime(milliseconds: number) {
    setRange((current) =>
      milliseconds <= current.end
        ? current
        : { ...current, end: milliseconds + 500 },
    )
  }

  function addCue() {
    const actionId = createStableId('act')
    const stepId = createStableId('tl')
    const action = createAction('show', actionId, scene, assets, locale)
    const step: TimelineStep = {
      id: stepId,
      at: sortedSteps.length === 0 ? 0 : duration + 500,
      actionId,
    }

    onChange({
      ...scene,
      actions: [...scene.actions, action],
      timeline: [...scene.timeline, step],
    })
    setSelectedStepId(stepId)
  }

  function removeCue() {
    if (!selectedStep) return
    const nextSelected =
      sortedSteps[selectedIndex + 1] ?? sortedSteps[selectedIndex - 1] ?? null
    onChange({
      ...scene,
      timeline: scene.timeline.filter((step) => step.id !== selectedStep.id),
    })
    setSelectedStepId(nextSelected?.id ?? null)
  }

  function changeActionKind(kind: EditableActionKind) {
    if (!selectedAction) return
    const nextAction = createAction(
      kind,
      selectedAction.id,
      scene,
      assets,
      locale,
    )
    updateAction({
      ...nextAction,
      label: selectedAction.label,
      metadata: selectedAction.metadata,
    })
  }

  const availableActionKinds = editableActionKinds.filter(
    (kind) =>
      kind !== 'pauseUntilInteraction' || scene.interactions.length > 0,
  )

  function zoomTimeline(factor: number) {
    setRange((current) => {
      const currentDuration = current.end - current.start
      const nextDuration = Math.min(60_000, Math.max(1_000, currentDuration * factor))
      const center = (current.start + current.end) / 2
      const start = Math.max(0, center - nextDuration / 2)
      return { start, end: start + nextDuration }
    })
  }

  function fitTimeline() {
    setRange({ start: 0, end: Math.max(6_000, duration + 1_000) })
  }

  return (
    <section className="flex min-h-64 min-w-0 max-w-full flex-col overflow-x-hidden border-t border-border bg-card xl:overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium">Timeline</p>
          <Badge variant="outline">{sortedSteps.length} cues</Badge>
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatPlayheadTime(playheadMs)} / {formatTime(duration)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Zoom out" onClick={() => zoomTimeline(1.35)}>
            <Minus />
          </IconButton>
          <IconButton label="Fit timeline" onClick={fitTimeline}>
            <Maximize2 />
          </IconButton>
          <IconButton label="Zoom in" onClick={() => zoomTimeline(0.75)}>
            <Plus />
          </IconButton>
          <IconButton label="Add cue" onClick={addCue}>
            <Plus />
          </IconButton>
        </div>
      </div>

      {sortedSteps.length > 0 ? (
        <TimelineCanvas
          scene={scene}
          assets={assets}
          locale={locale}
          range={range}
          selectedStepId={selectedStep?.id ?? null}
          playheadMs={playheadMs}
          onRangeChange={setRange}
          onPlayheadChange={onPlayheadChange}
          onSelectStep={setSelectedStepId}
          onMoveStep={moveCueTo}
          onResizeStep={resizeCue}
        />
      ) : (
        <div className="flex h-24 items-center justify-center border-b border-border px-4">
          <p className="text-xs text-muted-foreground">
            Add the first cue to start programming this scene.
          </p>
        </div>
      )}

      {selectedStep && selectedAction ? (
        <div className="min-w-0 overflow-x-auto border-t border-border bg-muted/20 px-4 py-3">
          <div className="flex min-w-max items-start gap-4">
            <FieldGroup
              className="grid flex-none grid-flow-col grid-rows-1 auto-cols-[160px] gap-3"
              style={{ width: getEditorWidth(selectedAction.kind) }}
            >
              <Field>
                <FieldLabel htmlFor="timeline-cue-label">Cue label</FieldLabel>
                <Input
                  id="timeline-cue-label"
                  value={readOptionalText(selectedStep.label, locale)}
                  placeholder={actionLabels[selectedAction.kind as EditableActionKind] ?? selectedAction.kind}
                  onChange={(event) =>
                    updateStep({
                      ...selectedStep,
                      label: updateOptionalText(
                        selectedStep.label,
                        locale,
                        event.target.value,
                      ),
                    })
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Action</FieldLabel>
                <Select
                  value={selectedAction.kind}
                  onValueChange={(value) =>
                    value && changeActionKind(value as EditableActionKind)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {availableActionKinds.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {actionLabels[kind]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="timeline-cue-at">Start (ms)</FieldLabel>
                <Input
                  id="timeline-cue-at"
                  type="number"
                  min={0}
                  step={100}
                  value={selectedStep.at}
                  onChange={(event) =>
                    updateStep({
                      ...selectedStep,
                      at: parseMilliseconds(event.target.value),
                    })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="timeline-cue-duration">
                  Duration (ms)
                </FieldLabel>
                <Input
                  id="timeline-cue-duration"
                  type="number"
                  min={0}
                  step={100}
                  value={selectedStep.durationMs ?? ''}
                  placeholder="Optional"
                  onChange={(event) =>
                    updateCueDuration(
                      scene,
                      selectedStep,
                      selectedAction,
                      event.target.value
                        ? parseMilliseconds(event.target.value)
                        : undefined,
                      onChange,
                    )
                  }
                />
              </Field>

              <ActionFields
                action={selectedAction}
                scene={scene}
                assets={assets}
                locale={locale}
                onChange={updateAction}
              />
            </FieldGroup>

            <div className="flex shrink-0 items-center gap-1 pt-6">
              <IconButton label="Remove cue" destructive onClick={removeCue}>
                <Trash2 />
              </IconButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Timeline actions stay available for events even when no cue uses them.
          </p>
        </div>
      )}
    </section>
  )
}

function ActionFields({
  action,
  scene,
  assets,
  locale,
  onChange,
}: {
  action: SceneAction
  scene: SceneData
  assets: MockAsset[]
  locale: string
  onChange: (action: SceneAction) => void
}) {
  if (
    action.kind === 'show' ||
    action.kind === 'hide' ||
    action.kind === 'highlight' ||
    action.kind === 'speak' ||
    action.kind === 'animate'
  ) {
    return (
      <>
        <ReferenceSelect
          label="Target element"
          value={action.targetId}
          options={scene.elements.map((element) => ({
            value: element.id,
            label: `${element.kind} · ${element.id}`,
          }))}
          onChange={(targetId) => onChange({ ...action, targetId })}
        />
        {action.kind === 'highlight' ? (
          <ReferenceSelect
            label="Effect"
            value={action.effect}
            options={['pulse', 'outline', 'glow', 'underline'].map((value) => ({
              value,
              label: value,
            }))}
            onChange={(effect) =>
              onChange({ ...action, effect: effect as typeof action.effect })
            }
          />
        ) : null}
        {action.kind === 'speak' ? (
          <Field className="col-span-2">
            <FieldLabel htmlFor="timeline-speech-text">Speech text</FieldLabel>
            <Input
              id="timeline-speech-text"
              value={readOptionalText(action.text, locale)}
              onChange={(event) =>
                onChange({
                  ...action,
                  text: { ...action.text, [locale]: event.target.value },
                })
              }
            />
          </Field>
        ) : null}
        {action.kind === 'animate' ? (
          <ReferenceSelect
            label="Animation"
            value={action.animation}
            options={[
              'fadeIn',
              'fadeOut',
              'slideIn',
              'slideOut',
              'scale',
              'shake',
            ].map((value) => ({ value, label: value }))}
            onChange={(animation) =>
              onChange({
                ...action,
                animation: animation as typeof action.animation,
              })
            }
          />
        ) : null}
      </>
    )
  }

  if (action.kind === 'playAudio') {
    const audioAssets = assets.filter((asset) => asset.kind === 'audio')
    return (
      <Field className="col-span-2">
        <FieldLabel>Audio asset</FieldLabel>
        <Select
          value={action.assetId ?? ''}
          onValueChange={(assetId) =>
            assetId && onChange({ ...action, assetId, url: undefined })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose audio" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {audioAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {readOptionalText(asset.label, locale) || asset.id} · {asset.status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {audioAssets.length === 0 ? (
          <FieldDescription>Add an audio asset in the mock library first.</FieldDescription>
        ) : null}
      </Field>
    )
  }

  if (action.kind === 'wait') {
    return (
      <Field>
        <FieldLabel htmlFor="timeline-wait-duration">Wait (ms)</FieldLabel>
        <Input
          id="timeline-wait-duration"
          type="number"
          min={0}
          step={100}
          value={action.durationMs}
          onChange={(event) =>
            onChange({
              ...action,
              durationMs: parseMilliseconds(event.target.value),
            })
          }
        />
      </Field>
    )
  }

  if (action.kind === 'pauseUntilInteraction') {
    return (
      <ReferenceSelect
        label="Interaction"
        value={action.interactionId}
        options={scene.interactions.map((interaction) => ({
          value: interaction.id,
          label: `${interaction.kind} · ${interaction.id}`,
        }))}
        onChange={(interactionId) => onChange({ ...action, interactionId })}
      />
    )
  }

  return (
    <p className="self-end pb-2 text-xs text-muted-foreground">
      This action has no additional parameters.
    </p>
  )
}

function ReferenceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={(nextValue) => nextValue && onChange(nextValue)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function IconButton({
  label,
  destructive = false,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string
  destructive?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={destructive ? 'destructive' : 'outline'}
            size="icon-sm"
            aria-label={label}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function createAction(
  kind: EditableActionKind,
  id: string,
  scene: SceneData,
  assets: MockAsset[],
  locale: string,
): SceneAction {
  const targetId = scene.elements[0]?.id ?? 'missing_element'

  switch (kind) {
    case 'show':
    case 'hide':
      return { id, kind, targetId }
    case 'highlight':
      return { id, kind, targetId, effect: 'pulse', durationMs: 900 }
    case 'playAudio':
      return {
        id,
        kind,
        assetId: assets.find((asset) => asset.kind === 'audio')?.id,
        targetId,
      }
    case 'speak':
      return {
        id,
        kind,
        targetId:
          scene.elements.find((element) => element.kind === 'mascot')?.id ??
          targetId,
        text: { [locale]: 'New narration' },
        durationMs: 1200,
      }
    case 'pause':
      return { id, kind }
    case 'wait':
      return { id, kind, durationMs: 500 }
    case 'pauseUntilInteraction':
      return {
        id,
        kind,
        interactionId: scene.interactions[0]?.id ?? 'missing_interaction',
      }
    case 'animate':
      return {
        id,
        kind,
        targetId,
        animation: 'fadeIn',
        durationMs: 300,
      }
  }
}

function getEditorWidth(kind: SceneAction['kind']) {
  const actionColumns =
    kind === 'speak'
      ? 3
      : kind === 'highlight' ||
          kind === 'animate' ||
          kind === 'playAudio'
        ? 2
        : 1
  const columns = 4 + actionColumns
  return columns * 160 + (columns - 1) * 12
}

function getInitialRangeEnd(scene: SceneData, assets?: MockAsset[]) {
  const assetsById = assets
    ? new Map(assets.map((asset) => [asset.id, asset]))
    : undefined
  const duration = getTimelineDuration(scene, assetsById)
  return Math.max(6_000, duration + 1_000)
}

function updateCueDuration(
  scene: SceneData,
  step: TimelineStep,
  action: SceneAction,
  durationMs: number | undefined,
  onChange: (scene: SceneData) => void,
) {
  const nextAction =
    durationMs === undefined ? action : updateActionDuration(action, durationMs)
  onChange({
    ...scene,
    timeline: scene.timeline.map((candidate) =>
      candidate.id === step.id ? { ...candidate, durationMs } : candidate,
    ),
    actions: scene.actions.map((candidate) =>
      candidate.id === nextAction.id ? nextAction : candidate,
    ),
  })
}

function updateActionDuration(action: SceneAction, durationMs: number): SceneAction {
  switch (action.kind) {
    case 'highlight':
    case 'speak':
    case 'wait':
    case 'move':
    case 'animate':
      return { ...action, durationMs }
    default:
      return action
  }
}

function parseMilliseconds(value: string) {
  const milliseconds = Number(value)
  return Number.isFinite(milliseconds)
    ? Math.max(0, Math.round(milliseconds))
    : 0
}

function readOptionalText(
  value: Record<string, string> | undefined,
  locale: string,
) {
  if (!value) return ''
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}

function updateOptionalText(
  value: Record<string, string> | undefined,
  locale: string,
  text: string,
) {
  const nextValue = { ...value }
  if (text) nextValue[locale] = text
  else delete nextValue[locale]
  return Object.keys(nextValue).length > 0 ? nextValue : undefined
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function formatPlayheadTime(milliseconds: number) {
  const totalSeconds = Math.max(0, milliseconds) / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds - minutes * 60
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`
}
