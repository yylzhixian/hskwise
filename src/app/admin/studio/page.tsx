import type { Metadata } from 'next'

import { sampleCourseStudioProject } from '@/features/course-studio/scene-schema/samples'
import { courseStudioRegistry } from '@/features/course-studio/scene-schema/registries'
import { CourseStudioDemo } from '@/features/course-studio/studio-preview/course-studio-demo'

export const metadata: Metadata = {
  title: 'Course Studio | HSKWise',
  description: 'Interactive Course Studio prototype for HSKWise.',
}

export default function Page() {
  return (
    <CourseStudioDemo
      project={sampleCourseStudioProject}
      registrySummary={{
        elements: courseStudioRegistry.elements.length,
        actions: courseStudioRegistry.actions.length,
        interactions: courseStudioRegistry.interactions.length,
      }}
    />
  )
}
