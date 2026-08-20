import type { Metadata } from 'next'
import { BookOpenIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PinyinLessonExperience } from '@/features/courses/pinyin/components/pinyin-lesson-experience'
import { getPublishedLesson } from '@/features/courses/registry/lesson-registry'
import { LessonRuntimeExperience } from '@/features/lesson-runtime/components/lesson-runtime-experience'
import {
  isRuntimeMediaFixtureId,
  type RuntimeMediaFixtureId,
} from '@/features/lesson-runtime/fixtures/runtime-media-fixtures'
import { LessonChrome } from '@/features/learning-shell/components/lesson-chrome'

const lessonTitles: Record<string, string> = {
  'four-tones': 'Meet the four tones',
  'first-greeting': 'Your first greeting',
  'first-words': 'Your first words',
  'starter-checkpoint': 'Starter checkpoint',
}

export const metadata: Metadata = {
  title: 'Lesson',
}

export default async function Page({
  params,
  searchParams,
}: PageProps<'/lessons/[lessonId]'>) {
  const { lessonId } = await params
  const query = await searchParams
  const mediaParam = Array.isArray(query.media) ? query.media[0] : query.media
  const mediaFixtureId: RuntimeMediaFixtureId = isRuntimeMediaFixtureId(
    mediaParam,
  )
    ? mediaParam
    : 'normal'

  if (lessonId === 'runtime-lab') {
    return <LessonRuntimeExperience mediaFixtureId={mediaFixtureId} />
  }

  const lesson = getPublishedLesson(lessonId)
  if (lesson?.kind === 'pinyin') {
    return <PinyinLessonExperience lesson={lesson} />
  }

  const lessonTitle = lessonTitles[lessonId] ?? 'Mandarin lesson'

  return (
    <LessonChrome title={lessonTitle}>
      <section className="flex w-full flex-col items-center gap-6 text-center">
        <Badge variant="outline">Lesson preview</Badge>
        <div className="flex max-w-lg flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
            {lessonTitle}
          </h1>
          <p className="leading-7 text-muted-foreground">
            This lesson is not available yet. Your place on the learning path
            is unchanged.
          </p>
        </div>
        <Alert className="max-w-lg text-start">
          <BookOpenIcon />
          <AlertTitle>Lesson content unavailable</AlertTitle>
          <AlertDescription>
            Return to your learning path and choose another available activity.
          </AlertDescription>
        </Alert>
      </section>
    </LessonChrome>
  )
}
