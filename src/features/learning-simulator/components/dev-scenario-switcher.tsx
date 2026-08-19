'use client'

import { RotateCcwIcon, SlidersHorizontalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLearningActions } from '@/features/learning-state/hooks/use-learning-actions'
import { useLearningScenario } from '@/features/learning-state/hooks/use-learning-scenario'

import { learningFixtureOptions } from '../fixtures/learning-fixtures'

const scenarioOptions = [
  { label: 'Normal session', value: 'normal' },
  ...learningFixtureOptions,
]

export function DevScenarioSwitcher() {
  const { resetProgress } = useLearningActions()
  const { fixtureId } = useLearningScenario()

  if (process.env.NODE_ENV === 'production') return null

  function switchScenario(value: unknown) {
    if (typeof value !== 'string') return

    const url = new URL(window.location.href)
    if (value === 'normal') {
      url.searchParams.delete('fixture')
    } else {
      url.searchParams.set('fixture', value)
    }
    url.hash = ''
    window.location.assign(url)
  }

  return (
    <aside
      aria-label="Development learning scenario"
      className="mx-auto mb-[calc(5rem+env(safe-area-inset-bottom))] flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 rounded-lg border bg-popover p-1 shadow-sm md:mb-4"
    >
      <SlidersHorizontalIcon
        aria-hidden="true"
        className="ms-2 size-4 text-muted-foreground"
      />
      <Select
        items={scenarioOptions}
        onValueChange={switchScenario}
        value={fixtureId ?? 'normal'}
      >
        <SelectTrigger
          aria-label="Learning scenario"
          className="h-8 max-w-44 rounded-md border-0 bg-transparent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} side="top">
          <SelectGroup>
            <SelectLabel>Learning scenario</SelectLabel>
            {scenarioOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        aria-label="Reset learning progress"
        onClick={() => resetProgress()}
        size="icon-sm"
        variant="ghost"
      >
        <RotateCcwIcon />
      </Button>
    </aside>
  )
}
