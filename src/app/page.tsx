import { GoalEntry } from '@/features/learning-entry/components/goal-entry'
import { LearningShell } from '@/features/learning-shell/components/learning-shell'

export default function Page() {
  return (
    <LearningShell>
      <GoalEntry />
    </LearningShell>
  )
}
