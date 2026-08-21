const combiningMarksPattern = /\p{M}/gu
const ignoredAnswerCharactersPattern = /[\p{P}\p{S}\s]/gu
const hanSequencePattern = /\p{Script=Han}+/gu
const parentheticalPattern = /\(([^)]+)\)/g
const toneNamePattern = /\b(first|second|third|fourth) tone\b/gi

const toneNumbers: Record<string, string> = {
  first: '1',
  second: '2',
  third: '3',
  fourth: '4',
}

export function normalizeReviewAnswer(value: string) {
  return value
    .normalize('NFKD')
    .replace(combiningMarksPattern, '')
    .toLocaleLowerCase('en-US')
    .replace(ignoredAnswerCharactersPattern, '')
}

export function isReviewAnswerCorrect(
  answer: string,
  acceptedAnswers: readonly string[],
) {
  const normalizedAnswer = normalizeReviewAnswer(answer)
  if (!normalizedAnswer) return false

  return acceptedAnswers.some(
    (candidate) => normalizeReviewAnswer(candidate) === normalizedAnswer,
  )
}

export function getReviewAcceptedAnswers({
  acceptedAnswers,
  correction,
}: {
  acceptedAnswers?: readonly string[]
  correction: string
}) {
  if (acceptedAnswers?.length) return [...acceptedAnswers]

  const candidates = new Set<string>(correction.match(hanSequencePattern) ?? [])
  for (const match of correction.matchAll(parentheticalPattern)) {
    const candidate = match[1]?.trim()
    if (candidate) candidates.add(candidate)
  }
  for (const match of correction.matchAll(toneNamePattern)) {
    const toneName = match[0]
    const toneNumber = toneNumbers[match[1]?.toLocaleLowerCase('en-US')]
    if (toneName) candidates.add(toneName)
    if (toneNumber) candidates.add(`Tone ${toneNumber}`)
  }

  return [...candidates]
}

export function createChoiceAnswerCandidates({
  label,
  supportingText,
}: {
  label: string
  supportingText?: string
}) {
  return supportingText
    ? [label, supportingText, `${label} ${supportingText}`]
    : [label]
}
