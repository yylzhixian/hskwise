import { CheckCircle2Icon } from 'lucide-react'

import type { CheckpointStep } from '../model/checkpoint-schema'

export function CheckpointSummary({
  step,
}: {
  step: Extract<CheckpointStep, { kind: 'checkpoint-summary' }>
}) {
  return (
    <section className="w-full border-y" aria-label="Checkpoint summary">
      <div className="py-5">
        <p className="text-sm font-semibold text-focus">Starter route</p>
        <p className="mt-2 text-4xl font-semibold tracking-normal">4 / 4</p>
        <p className="mt-2 text-sm text-muted-foreground">Core connections checked</p>
      </div>
      <ul className="divide-y border-t">
        {step.takeaways.map((takeaway) => (
          <li className="flex items-start gap-3 py-4" key={takeaway}>
            <CheckCircle2Icon className="mt-0.5 text-focus" />
            <span className="leading-6">{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
