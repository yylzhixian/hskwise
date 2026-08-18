import { describe, expect, test } from 'bun:test'

import {
  evaluateClozeAnswer,
  evaluateDictationAnswer,
  evaluateMatchingAnswer,
  evaluateOrderingAnswer,
  evaluateShortAnswer,
  normalizeAnswerText,
} from './interaction-answer.ts'

describe('Course Studio interaction answers', () => {
  test('matching requires every source to use its own target', () => {
    const interaction = {
      kind: 'matching',
      pairs: [
        { id: 'pair_nihao' },
        { id: 'pair_wo' },
      ],
    }

    expect(
      evaluateMatchingAnswer(interaction, {
        matches: [
          { sourcePairId: 'pair_nihao', targetPairId: 'pair_wo' },
          { sourcePairId: 'pair_wo', targetPairId: 'pair_nihao' },
        ],
      }),
    ).toBe(false)
    expect(
      evaluateMatchingAnswer(interaction, {
        matches: [
          { sourcePairId: 'pair_nihao', targetPairId: 'pair_nihao' },
          { sourcePairId: 'pair_wo', targetPairId: 'pair_wo' },
        ],
      }),
    ).toBe(true)
  })

  test('ordering follows correctOrder rather than authored array order', () => {
    const interaction = {
      kind: 'ordering',
      items: [
        { id: 'item_second', correctOrder: 2 },
        { id: 'item_first', correctOrder: 1 },
        { id: 'item_third', correctOrder: 3 },
      ],
    }

    expect(
      evaluateOrderingAnswer(interaction, {
        itemIds: ['item_first', 'item_second', 'item_third'],
      }),
    ).toBe(true)
    expect(
      evaluateOrderingAnswer(interaction, {
        itemIds: ['item_second', 'item_first', 'item_third'],
      }),
    ).toBe(false)
  })

  test('cloze accepts configured variants after text normalization', () => {
    const interaction = {
      kind: 'cloze',
      blanks: [
        { id: 'blank_name', acceptedAnswers: ['Wǒ jiào', '我叫'] },
        { id: 'blank_country', acceptedAnswers: ['中国'] },
      ],
    }

    expect(
      evaluateClozeAnswer(interaction, {
        values: {
          blank_name: '  WǑ   JIÀO ',
          blank_country: '中国',
        },
      }),
    ).toBe(true)
    expect(normalizeAnswerText('  NǏ   HǍO ')).toBe('nǐ hǎo')
  })

  test('dictation accepts expected text and explicit alternatives only', () => {
    const interaction = {
      kind: 'dictation',
      expectedText: '你好吗？',
      acceptedAnswers: ['你好吗?'],
    }

    expect(
      evaluateDictationAnswer(interaction, { text: '你好吗?' }),
    ).toBe(true)
    expect(
      evaluateDictationAnswer(interaction, { text: '你很好' }),
    ).toBe(false)
  })

  test('open short answers submit without pretending to be correct', () => {
    const interaction = {
      kind: 'shortAnswer',
      expectedAnswerKind: 'open',
      sampleAnswers: [],
      minLength: 3,
    }

    expect(evaluateShortAnswer(interaction, { text: '你好' })).toBe(false)
    expect(evaluateShortAnswer(interaction, { text: '你好吗' })).toBeNull()
  })

  test('exact short answers compare every localized sample answer', () => {
    const interaction = {
      kind: 'shortAnswer',
      expectedAnswerKind: 'exact',
      sampleAnswers: [
        { en: 'My name is Anna.', zhHans: '我叫安娜。' },
        { en: 'I am Anna.', zhHans: '我是安娜。' },
      ],
    }

    expect(evaluateShortAnswer(interaction, { text: '  我叫安娜。 ' })).toBe(true)
    expect(evaluateShortAnswer(interaction, { text: '我叫明。' })).toBe(false)
  })
})
