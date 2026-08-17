import type { Metadata } from 'next'

import { CourseStudioShell } from '@/features/course-studio/editor/course-studio-shell'
import { sampleCourseStudioProject } from '@/features/course-studio/scene-schema/samples'

export const metadata: Metadata = {
  title: 'Course Studio | HSKWise',
  description: 'Interactive Course Studio prototype for HSKWise.',
}

export default function Page() {
  return <CourseStudioShell initialProject={sampleCourseStudioProject} />
}
