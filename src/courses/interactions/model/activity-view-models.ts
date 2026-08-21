export type DialogueAudioView = {
  src: string
  label: string
  placeholder?: boolean
}

export type DialogueTokenView = {
  id: string
  text: string
  pinyin?: string
  meaning?: string
}

export type DialogueLineView = {
  id: string
  speakerId: string
  tokens: DialogueTokenView[]
  pinyin: string
  translation: string
  audio: DialogueAudioView
}

export type DialogueRoleView = {
  id: string
  name: string
  pinyin?: string
  cue?: string
}

export type DialogueView = {
  id: string
  roles: DialogueRoleView[]
  lines: DialogueLineView[]
}

export type LexemeSourceView = {
  contextText: string
  contextPinyin: string
  contextTranslation: string
  contextAudio: DialogueAudioView
}

export type LexemeView = {
  id: string
  text: string
  pinyin: string
  meaning: string
  usageNote?: string
  audio: DialogueAudioView
  source?: LexemeSourceView
}

export type DialogueOrderingView = {
  prompt: string
  lineIds: string[]
  startingOrder: string[]
}

export type RolePlayView = {
  roleIds: string[]
  countdownSeconds?: number
  handoffDelayMs?: number
}

export type ActiveRecallView = {
  cue: string
  revealLabel: string
}
