import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

import { z } from 'zod'

import { lessonV2Schema } from '../../src/courses/schema/lesson-schema'

const projectRoot = process.cwd()
const outputPath = resolve(projectRoot, 'schemas/lesson-v2.schema.json')
const generatedSchema = z.toJSONSchema(lessonV2Schema, {
  target: 'draft-2020-12',
  io: 'input',
})
const output = `${JSON.stringify(
  {
    ...generatedSchema,
    $id: 'https://hskwise.local/schemas/lesson-v2.schema.json',
    title: 'HSKWise Lesson v2',
  },
  null,
  2,
)}\n`

if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8')
  if (current !== output) {
    throw new Error(
      'Lesson v2 JSON Schema is stale. Run `bun run content:schema:generate`.',
    )
  }
} else {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, output)
  console.log(`Wrote ${relative(projectRoot, outputPath)}`)
}
