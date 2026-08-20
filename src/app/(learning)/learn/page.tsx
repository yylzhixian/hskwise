import type { Metadata } from 'next'

import { LearningHomeView } from '@/views/learning/learning-home-view'

export const metadata: Metadata = {
  title: 'Learn',
}

export default function Page() {
  return <LearningHomeView />
}
