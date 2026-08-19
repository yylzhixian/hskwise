import { Skeleton } from '@/components/ui/skeleton'
import { LessonChrome } from '@/features/learning-shell/components/lesson-chrome'

export default function Loading() {
  return (
    <LessonChrome title="Loading lesson">
      <section
        aria-label="Loading lesson"
        className="mx-auto flex w-full max-w-xl flex-col items-center gap-5"
      >
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-md" />
        <Skeleton className="h-24 w-full" />
      </section>
    </LessonChrome>
  )
}
