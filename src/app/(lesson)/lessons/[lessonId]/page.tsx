import type { Metadata } from 'next'

import { LessonView } from '@/views/lesson/lesson-view'

export const metadata: Metadata = {
  title: 'Lesson',
}

export default async function Page({
  params,
}: PageProps<'/lessons/[lessonId]'>) {
  const { lessonId } = await params

  return <LessonView lessonId={lessonId} />
}
