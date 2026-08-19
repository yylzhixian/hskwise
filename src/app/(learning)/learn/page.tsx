import type { Metadata } from 'next'

import { LearningHome } from '@/features/learning-routes/components/learning-home'

export const metadata: Metadata = {
  title: 'Learn',
}

export default function Page() {
  return <LearningHome />
}
