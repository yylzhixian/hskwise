import { CheckIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export function PinyinLessonSummary({
  completed,
  takeaways,
}: {
  completed: boolean
  takeaways: string[]
}) {
  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-4 border-y py-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-progress">Tone map ready</p>
          <p className="text-sm text-muted-foreground">
            Use these paths when a new syllable appears.
          </p>
        </div>
        <Badge variant={completed ? 'secondary' : 'outline'}>
          {completed ? 'Completed' : 'Ready to finish'}
        </Badge>
      </div>

      <ul className="flex flex-col gap-3">
        {takeaways.map((takeaway) => (
          <li className="flex items-start gap-3" key={takeaway}>
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-progress/15 text-progress">
              <CheckIcon className="size-4" />
            </span>
            <span className="leading-6">{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

