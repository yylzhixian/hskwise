export type LessonV2Issue = {
  path: PropertyKey[]
  message: string
}

export class LessonV2Error extends Error {
  readonly issues: LessonV2Issue[]

  constructor(message: string, issues: LessonV2Issue[]) {
    super(message)
    this.name = 'LessonV2Error'
    this.issues = issues
  }
}
