import type { Metadata } from 'next'

import { MistakesView } from '@/views/mistakes/mistakes-view'

export const metadata: Metadata = {
  title: 'Mistakes',
}

export default function Page() {
  return <MistakesView />
}
