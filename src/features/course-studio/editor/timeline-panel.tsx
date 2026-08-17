import { Pause, Play, Volume2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { SceneData } from '../scene-schema/scene-schema'

export function TimelinePanel({ scene }: { scene: SceneData }) {
  const actionMap = new Map(scene.actions.map((action) => [action.id, action]))
  const steps = scene.timeline.toSorted((a, b) => a.at - b.at)
  const duration = Math.max(1, ...steps.map((step) => step.at + (step.durationMs ?? 0)))

  return (
    <section className="flex min-h-28 min-w-0 max-w-full flex-col overflow-hidden border-t border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium">Timeline</p>
          <Badge variant="outline">{steps.length} cues</Badge>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">{formatTime(duration)}</p>
      </div>

      <div className="flex min-h-0 min-w-0 max-w-full flex-1 overflow-x-auto px-4 py-3">
        <div className="relative h-12 w-[640px] shrink-0 border-t border-border">
          {steps.length > 0 ? (
            steps.map((step, index) => {
              const action = actionMap.get(step.actionId)
              const left = `${Math.min(96, (step.at / duration) * 100)}%`
              const Icon = getTimelineIcon(action?.kind)

              return (
                <div
                  key={step.id}
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                  style={{ left }}
                >
                  <span className="h-2 w-px bg-border" />
                  <div className="flex h-7 max-w-36 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs shadow-sm [&_svg]:size-3">
                    <Icon aria-hidden />
                    <span className="truncate">{action?.kind ?? `Cue ${index + 1}`}</span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="pt-3 text-xs text-muted-foreground">No timeline cues in this scene.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function getTimelineIcon(kind?: string) {
  if (kind === 'playAudio' || kind === 'speak') return Volume2
  if (kind === 'pause' || kind === 'pauseUntilInteraction') return Pause
  return Play
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}
