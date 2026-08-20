import { LearningShell } from '@/components/learning-shell/learning-shell'

import { GoalEntry } from './components/goal-entry'

export function HomeView() {
  return (
    <LearningShell>
      <GoalEntry />
    </LearningShell>
  )
}
