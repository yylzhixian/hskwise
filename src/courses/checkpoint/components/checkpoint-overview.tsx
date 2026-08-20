import {
  AudioLinesIcon,
  LanguagesIcon,
  ListOrderedIcon,
  MessagesSquareIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import type { CheckpointStep } from '../model/checkpoint-schema'

export function CheckpointOverview({
  step,
}: {
  step: Extract<CheckpointStep, { kind: 'checkpoint-intro' }>
}) {
  const signals = [
    { icon: AudioLinesIcon, label: 'Tone listening' },
    { icon: LanguagesIcon, label: 'Word meaning' },
    { icon: MessagesSquareIcon, label: 'Natural response' },
    { icon: ListOrderedIcon, label: 'Dialogue order' },
  ]

  return (
    <section className="w-full border-y py-2" aria-label="Checkpoint coverage">
      <div className="flex items-center justify-between gap-3 border-b py-4">
        <div>
          <p className="font-semibold">Four short checks</p>
          <p className="text-sm text-muted-foreground">
            Revisits {step.reviewedLessonIds.length} completed lessons. No new material.
          </p>
        </div>
        <Badge variant="outline">About 6 min</Badge>
      </div>
      <ul className="divide-y">
        {signals.map(({ icon: Icon, label }, index) => (
          <li className="flex items-center gap-3 py-4" key={label}>
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-focus">
              <Icon />
            </span>
            <span className="min-w-0 flex-1 font-medium">{label}</span>
            <span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
          </li>
        ))}
      </ul>
      <p className="py-4 text-sm leading-6 text-muted-foreground">
        A missed answer is saved with its exact checkpoint step so it can return in review.
      </p>
    </section>
  )
}
