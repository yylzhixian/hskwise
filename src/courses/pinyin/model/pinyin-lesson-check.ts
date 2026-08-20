import type {
  PinyinLessonCheckQuestion,
  PinyinTone,
} from './pinyin-lesson-schema'

export type PinyinLessonCheckState = {
  answers: number[]
  feedback: { kind: 'correct' | 'incorrect'; message: string } | null
  questionIndex: number
  selectedToneNumber: PinyinTone['number'] | null
}

export type PinyinLessonCheckAction =
  | { type: 'tone.selected'; toneNumber: PinyinTone['number'] }
  | { type: 'answer.submitted'; question: PinyinLessonCheckQuestion }
  | { type: 'question.advanced' }

export const initialPinyinLessonCheckState: PinyinLessonCheckState = {
  answers: [],
  feedback: null,
  questionIndex: 0,
  selectedToneNumber: null,
}

export function reducePinyinLessonCheck(
  state: PinyinLessonCheckState,
  action: PinyinLessonCheckAction,
): PinyinLessonCheckState {
  if (action.type === 'tone.selected') {
    return {
      ...state,
      feedback: null,
      selectedToneNumber: action.toneNumber,
    }
  }

  if (action.type === 'answer.submitted') {
    if (state.selectedToneNumber === null) return state
    const isCorrect =
      state.selectedToneNumber === action.question.correctToneNumber

    return {
      ...state,
      feedback: {
        kind: isCorrect ? 'correct' : 'incorrect',
        message: isCorrect
          ? action.question.correctFeedback
          : action.question.incorrectFeedback,
      },
    }
  }

  if (
    state.feedback?.kind !== 'correct' ||
    state.selectedToneNumber === null
  ) {
    return state
  }

  return {
    answers: [...state.answers, state.selectedToneNumber],
    feedback: null,
    questionIndex: state.questionIndex + 1,
    selectedToneNumber: null,
  }
}
