import type { SceneInteraction } from '../scene-schema/interaction-schema'
import {
  areOrderedIdsEqual,
  isAcceptedText,
  normalizeAnswerText,
} from '@/features/learning-core/model/answer-evaluation'

export { isAcceptedText, normalizeAnswerText }

type MatchingInteraction = Extract<SceneInteraction, { kind: 'matching' }>
type OrderingInteraction = Extract<SceneInteraction, { kind: 'ordering' }>
type ClozeInteraction = Extract<SceneInteraction, { kind: 'cloze' }>
type DictationInteraction = Extract<SceneInteraction, { kind: 'dictation' }>
type ShortAnswerInteraction = Extract<SceneInteraction, { kind: 'shortAnswer' }>

export type MatchingAnswer = {
  matches: Array<{
    sourcePairId: string
    targetPairId: string
  }>
}

export type OrderingAnswer = {
  itemIds: string[]
}

export type ClozeAnswer = {
  values: Record<string, string>
}

export type DictationAnswer = {
  text: string
}

export type ShortAnswerAnswer = {
  text: string
}

export function evaluateMatchingAnswer(
  interaction: MatchingInteraction,
  answer: MatchingAnswer,
) {
  if (answer.matches.length !== interaction.pairs.length) return false
  const matches = new Map(
    answer.matches.map((match) => [match.sourcePairId, match.targetPairId]),
  )
  return interaction.pairs.every(
    (pair) => matches.get(pair.id) === pair.id,
  )
}

export function evaluateOrderingAnswer(
  interaction: OrderingInteraction,
  answer: OrderingAnswer,
) {
  const expectedItemIds = [...interaction.items]
    .sort((left, right) => left.correctOrder - right.correctOrder)
    .map((item) => item.id)
  return areOrderedIdsEqual(expectedItemIds, answer.itemIds)
}

export function evaluateClozeAnswer(
  interaction: ClozeInteraction,
  answer: ClozeAnswer,
) {
  return interaction.blanks.every((blank) =>
    isAcceptedText(answer.values[blank.id] ?? '', blank.acceptedAnswers),
  )
}

export function evaluateDictationAnswer(
  interaction: DictationInteraction,
  answer: DictationAnswer,
) {
  return isAcceptedText(answer.text, [
    interaction.expectedText,
    ...interaction.acceptedAnswers,
  ])
}

export function evaluateShortAnswer(
  interaction: ShortAnswerInteraction,
  answer: ShortAnswerAnswer,
): boolean | null {
  if (!meetsShortAnswerMinLength(interaction, answer)) return false
  if (interaction.expectedAnswerKind !== 'exact') return null

  return isAcceptedText(
    answer.text,
    interaction.sampleAnswers.flatMap((sample) => Object.values(sample)),
  )
}

export function meetsShortAnswerMinLength(
  interaction: Pick<ShortAnswerInteraction, 'minLength'>,
  answer: ShortAnswerAnswer,
) {
  const length = Array.from(normalizeAnswerText(answer.text)).length
  return length >= (interaction.minLength ?? 1)
}
