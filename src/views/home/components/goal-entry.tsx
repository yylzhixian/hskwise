'use client'

import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  CheckIcon,
  ClipboardCheckIcon,
  ScanSearchIcon,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { TonePathVisual } from '@/components/learning-shell/tone-path-visual'
import {
  type LearningGoalId,
  useLearningGoalSelection,
} from '../hooks/use-learning-goal-selection'

const learningGoals = [
  {
    id: 'guided-hsk-path',
    title: 'Follow the HSK 3.0 path',
    description: 'Start at Level 1 and build a steady foundation.',
    icon: BookOpenCheckIcon,
  },
  {
    id: 'exam-preparation',
    title: 'Prepare for an HSK exam',
    description: 'Work toward a clear level with focused practice.',
    icon: ClipboardCheckIcon,
  },
  {
    id: 'find-my-level',
    title: 'Help me find my level',
    description: 'Begin with a short guided placement path.',
    icon: ScanSearchIcon,
  },
] satisfies Array<{
  id: LearningGoalId
  title: string
  description: string
  icon: typeof BookOpenCheckIcon
}>

export function GoalEntry() {
  const { continueHref, selectGoal, selectedGoal } =
    useLearningGoalSelection()

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-8.0625rem)] w-full max-w-5xl content-center gap-5 px-4 py-3 sm:gap-7 sm:px-6 sm:py-12 md:min-h-[calc(100dvh-4.0625rem)] lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <Badge variant="outline">HSK 3.0 · Level 1</Badge>
        <h1 className="max-w-xl text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
          Build Mandarin step by step.
        </h1>
        <p className="max-w-lg text-base leading-7 text-muted-foreground">
          Choose the path that matches where you are today.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <TonePathVisual />
      </div>

      <FieldSet className="mx-auto w-full max-w-2xl gap-4">
        <div className="flex flex-col gap-1">
          <FieldLegend className="mb-0 text-lg font-semibold">
            What brings you here?
          </FieldLegend>
          <FieldDescription>
            You can change direction later without losing progress.
          </FieldDescription>
        </div>

        <ToggleGroup
          aria-label="Learning goal"
          className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3"
          onValueChange={selectGoal}
          size="learning"
          value={[selectedGoal]}
          variant="learning"
        >
          {learningGoals.map(({ description, icon: Icon, id, title }) => (
            <ToggleGroupItem key={id} value={id}>
              <Icon aria-hidden="true" data-icon="inline-start" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold text-balance">{title}</span>
                <span className="text-xs leading-5 font-normal text-muted-foreground text-balance">
                  {description}
                </span>
              </span>
              <CheckIcon
                aria-hidden="true"
                className="ms-auto opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100"
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Button
          className="w-full sm:mx-auto sm:max-w-xs"
          nativeButton={false}
          render={<Link href={continueHref} />}
          size="learning"
          variant="learning"
        >
          Start learning
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </FieldSet>
    </section>
  )
}
