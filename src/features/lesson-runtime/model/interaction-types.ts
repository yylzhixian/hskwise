export type ChoiceOption = {
  id: string
  label: string
  description?: string
  isCorrect: boolean
}

export type OrderingItem = {
  id: string
  label: string
  correctOrder: number
}
