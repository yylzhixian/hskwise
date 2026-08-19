import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <section
      aria-label="Loading learning path"
      className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="mx-auto h-40 w-full max-w-2xl" />
      <Skeleton className="min-h-72 w-full" />
    </section>
  )
}
