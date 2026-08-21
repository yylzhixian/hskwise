import { BookOpenIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PinyinLessonExperience } from '@/courses/pinyin/components/pinyin-lesson-experience'
import { getPublishedLesson } from '@/courses/lesson-registry'
import { getLessonV2Definition } from '@/courses/content/lesson-v2-registry'
import { V2LessonExperience } from '@/courses/interactions/v2-lesson-experience'
import { LessonChrome } from '@/components/learning-shell/lesson-chrome'
import { starterRoute } from '@/learning/routes/content/hsk3-level-1-starter'
import { getLessonPlacement } from '@/learning/routes/model/route-schema'

const lessonTitles: Record<string, string> = {
  'four-tones': 'Meet the four tones',
  'first-greeting': 'Your first greeting',
  'first-words': 'Your first words',
  'starter-checkpoint': 'Starter checkpoint',
}

export function LessonView({ lessonId }: { lessonId: string }) {
  const v2Definition = getLessonV2Definition(lessonId)
  if (v2Definition) {
    return (
      <V2LessonExperience
        definition={v2Definition}
        placement={getLessonPlacement(starterRoute, lessonId)}
      />
    )
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
