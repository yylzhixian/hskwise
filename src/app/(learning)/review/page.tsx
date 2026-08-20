import type { Metadata } from 'next'

import { ReviewView } from '@/views/review/review-view'

export const metadata: Metadata = {
  title: 'Review',
}

export default function Page() {
  return <ReviewView />
}
