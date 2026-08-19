'use client'

import { SlidersHorizontalIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  runtimeMediaFixtureOptions,
  type RuntimeMediaFixtureId,
} from '../fixtures/runtime-media-fixtures'

export function DevRuntimeScenarioSwitcher({
  fixtureId,
}: {
  fixtureId: RuntimeMediaFixtureId
}) {
  if (process.env.NODE_ENV === 'production') return null

  function switchScenario(value: unknown) {
    if (typeof value !== 'string') return
    const url = new URL(window.location.href)
    if (value === 'normal') url.searchParams.delete('media')
    else url.searchParams.set('media', value)
    url.hash = ''
    window.location.assign(url)
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <SlidersHorizontalIcon className="size-4" />
      <Select
        items={runtimeMediaFixtureOptions}
        onValueChange={switchScenario}
        value={fixtureId}
      >
        <SelectTrigger aria-label="Media scenario" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          <SelectGroup>
            <SelectLabel>Media scenario</SelectLabel>
            {runtimeMediaFixtureOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
