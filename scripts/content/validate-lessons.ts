import { readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'

import { auditLessonPublishability } from '../../src/courses/compiler/audit-lesson-publishability'
import { compileLessonV2 } from '../../src/courses/compiler/compile-lesson-v2'
import { parseLessonV2 } from '../../src/courses/compiler/validate-lesson-v2'

const projectRoot = process.cwd()
const lessonsRoot = resolve(projectRoot, 'src/courses/content/lessons')
const files = readdirSync(lessonsRoot)
  .filter((fileName) => fileName.endsWith('.v2.json'))
  .sort()
const lessons = files.map((fileName) => {
  const path = resolve(lessonsRoot, fileName)
  return {
    path,
    lesson: parseLessonV2(JSON.parse(readFileSync(path, 'utf8'))),
  }
})

let publishabilityIssues = 0
lessons.forEach(({ lesson, path }) => {
  const dependencies = lessons
    .map((item) => item.lesson)
    .filter((candidate) => candidate.id !== lesson.id)
  const context = { dependencies }
  compileLessonV2(lesson, context)
  const issues = auditLessonPublishability(lesson, context)
  publishabilityIssues += issues.length
  console.log(
    `Validated ${relative(projectRoot, path)} (${issues.length} publish blocker${issues.length === 1 ? '' : 's'})`,
  )
})

console.log(
  `Validated ${lessons.length} lesson/v2 files; ${publishabilityIssues} expected draft publish blockers.`,
)
