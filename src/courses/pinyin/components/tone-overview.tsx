import { Badge } from '@/components/ui/badge'

import type { PinyinTone } from '../model/pinyin-lesson-schema'
import { ToneContour } from './tone-contour'

export function ToneOverview({ tones }: { tones: PinyinTone[] }) {
  return (
    <section aria-label="Four Mandarin tone paths" className="w-full">
      <ol className="divide-y border-y">
        {tones.map((tone) => (
          <li
            className="grid min-h-28 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 py-3 sm:grid-cols-[2.5rem_10rem_minmax(0,1fr)] sm:gap-x-5"
            key={tone.number}
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-focus/50 bg-accent font-semibold text-focus">
              {tone.number}
            </span>
            <ToneContour className="max-w-48" tone={tone} />
            <div className="col-start-2 flex min-w-0 items-baseline justify-between gap-3 sm:col-start-3 sm:flex-col sm:justify-center sm:gap-1">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">{tone.shape}</span>
                <span className="text-sm text-muted-foreground">
                  {tone.cue}
                </span>
              </div>
              <Badge className="shrink-0" variant="outline">
                {tone.example}
              </Badge>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

