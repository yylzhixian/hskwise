export function normalizeAnswerText(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function isAcceptedText(value: string, acceptedAnswers: string[]) {
  const normalizedValue = normalizeAnswerText(value)

  return acceptedAnswers.some(
    (answer) => normalizeAnswerText(answer) === normalizedValue,
  )
}

export function areOrderedIdsEqual(expectedIds: string[], actualIds: string[]) {
  return (
    expectedIds.length === actualIds.length &&
    expectedIds.every((value, index) => value === actualIds[index])
  )
}
