import type { Metadata } from 'next'
import { ArrowLeftIcon, MapIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { TonePathVisual } from '@/features/learning-shell/components/tone-path-visual'

export const metadata: Metadata = {
  title: 'Learn',
}

export default function Page() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-4xl flex-col px-4 py-8 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-focus">Your path</p>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            HSK 3.0 Level 1
          </h1>
        </div>
        <Badge variant="outline">0% complete</Badge>
      </div>

      <div className="mx-auto mt-4 w-full max-w-2xl opacity-70" aria-hidden="true">
        <TonePathVisual />
      </div>

      <Empty className="min-h-72 p-6 sm:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapIcon />
          </EmptyMedia>
          <EmptyTitle>Your first route is almost ready</EmptyTitle>
          <EmptyDescription>
            It begins with Mandarin tones, then moves through greetings, first
            words, and a short checkpoint.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Change learning goal
          </Button>
        </EmptyContent>
      </Empty>
    </section>
  )
}
