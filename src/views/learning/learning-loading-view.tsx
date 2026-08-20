import { Skeleton } from '@/components/ui/skeleton'

export function LearningLoadingView() {
  return (
    <section
      aria-label="Loading learning path"
      className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-6xl flex-col gap-7 px-4 py-8 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <Skeleton className="h-[34rem] w-full" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    </section>
  )
}
