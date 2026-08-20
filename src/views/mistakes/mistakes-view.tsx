'use client'

import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  RotateCcwIcon,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatKebabLabel } from '@/lib/format-kebab-label'
import { cn } from '@/lib/utils'
import type { MistakeRecord } from '@/store/learning/model/learning-state-schema'

import {
  type MistakeStatusFilter,
  useMistakeBook,
} from './hooks/use-mistake-book'

const statusOptions: Array<{ label: string; value: MistakeStatusFilter }> = [
  { label: 'Open', value: 'open' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
]

export function MistakesView() {
  const book = useMistakeBook()

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8.0625rem)] w-full max-w-5xl flex-col gap-7 px-4 py-7 sm:px-6 sm:py-10 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <header className="flex flex-col gap-6 border-b pb-6">
        <Button
          className="self-start"
          nativeButton={false}
          render={<Link href="/learn" />}
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Learning path
        </Button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-focus">Correction log</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Mistakes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Revisit the exact prompt and correction behind each review item.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/review" />}
            variant="learning"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Review due items
          </Button>
        </div>

        <dl className="grid grid-cols-3 divide-x border-y py-4">
          <MistakeStat label="Open" value={book.openCount} />
          <MistakeStat label="Resolved" value={book.resolvedCount} />
          <MistakeStat label="Total" value={book.totalCount} />
        </dl>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ToggleGroup
            aria-label="Mistake status"
            onValueChange={(values) => {
              const value = values[0] as MistakeStatusFilter | undefined
              if (value) book.setStatus(value)
            }}
            spacing={0}
            value={[book.status]}
            variant="outline"
          >
            {statusOptions.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {book.sources.length > 1 ? (
            <ToggleGroup
              aria-label="Mistake source"
              className="max-w-full flex-wrap"
              onValueChange={(values) => {
                const value = values[0]
                if (value) book.setSource(value)
              }}
              value={[book.source]}
              variant="default"
            >
              <ToggleGroupItem value="all">All lessons</ToggleGroupItem>
              {book.sources.map((source) => (
                <ToggleGroupItem key={source} value={source}>
                  {formatKebabLabel(source)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}
        </div>

        {book.filteredItems.length > 0 ? (
          <div className="border-y">
            <Table className="min-w-[52rem] table-fixed">
              <TableCaption className="sr-only">
                Mistakes matching the current status and lesson filters.
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28 px-3">Status</TableHead>
                  <TableHead className="w-[28%] px-3">Prompt</TableHead>
                  <TableHead className="w-[38%] px-3">Correction</TableHead>
                  <TableHead className="w-36 px-3">Source</TableHead>
                  <TableHead className="w-24 px-3 text-end">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book.filteredItems.map((mistake) => (
                  <MistakeRow key={mistake.id} mistake={mistake} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Empty className="min-h-80 rounded-md border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle2Icon />
              </EmptyMedia>
              <EmptyTitle>No mistakes in this view</EmptyTitle>
              <EmptyDescription>
                Try another filter, or continue learning to build your
                correction history.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  )
}

function MistakeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function MistakeRow({ mistake }: { mistake: MistakeRecord }) {
  return (
    <TableRow>
      <TableCell className="px-3 py-5 align-top">
        <Badge
          className={cn(
            'rounded-sm',
            mistake.resolved &&
              'border-route-complete-border bg-route-complete-surface text-route-complete-foreground',
          )}
          variant="outline"
        >
          {mistake.resolved ? (
            <CheckCircle2Icon data-icon="inline-start" />
          ) : (
            <CircleAlertIcon data-icon="inline-start" />
          )}
          {mistake.resolved ? 'Resolved' : 'Open'}
        </Badge>
      </TableCell>
      <TableCell className="px-3 py-5 align-top whitespace-normal">
        <p className="text-sm leading-6 font-medium">
          {mistake.prompt}
        </p>
      </TableCell>
      <TableCell className="px-3 py-5 align-top whitespace-normal">
        <p className="border-s-2 border-focus/60 ps-4 text-sm leading-6">
          {mistake.correction}
        </p>
      </TableCell>
      <TableCell className="px-3 py-5 align-top text-xs text-muted-foreground whitespace-normal">
        {formatKebabLabel(mistake.lessonId)}
      </TableCell>
      <TableCell className="px-3 py-5 text-end align-top text-xs text-muted-foreground">
        <time dateTime={mistake.occurredAt}>
          {formatDate(mistake.occurredAt)}
        </time>
      </TableCell>
    </TableRow>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}
