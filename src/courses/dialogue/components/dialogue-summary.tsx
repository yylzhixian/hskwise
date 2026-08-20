import { CheckCircle2Icon } from 'lucide-react'

import type { DialogueLessonStep } from '../model/dialogue-lesson-schema'

type DialogueSummaryStep = Extract<
  DialogueLessonStep,
  { kind: 'dialogue-summary' }
>

export function DialogueSummary({ step }: { step: DialogueSummaryStep }) {
  return (
    <section className="w-full border-y py-6">
      <ul className="flex flex-col gap-4">
        {step.takeaways.map((takeaway) => (
          <li className="grid grid-cols-[auto_1fr] gap-3" key={takeaway}>
            <CheckCircle2Icon className="mt-0.5 size-5 text-route-complete-foreground" />
            <span className="leading-7">{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
