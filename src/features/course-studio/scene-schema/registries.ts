import { z } from 'zod'

import { ActionKindSchema } from './action-schema'
import { ElementKindSchema } from './element-schema'
import { InteractionKindSchema } from './interaction-schema'
import { RegistryItemSchema } from './shared'

const ElementRegistryItemSchema = RegistryItemSchema.extend({
  kind: ElementKindSchema,
}).strict()

const ActionRegistryItemSchema = RegistryItemSchema.extend({
  kind: ActionKindSchema,
}).strict()

const InteractionRegistryItemSchema = RegistryItemSchema.extend({
  kind: InteractionKindSchema,
}).strict()

export const elementRegistry = z.array(ElementRegistryItemSchema).parse([
  { kind: 'text', label: { en: 'Text', zhHans: '文本' } },
  { kind: 'callout', label: { en: 'Callout', zhHans: '提示' } },
  { kind: 'image', label: { en: 'Image', zhHans: '图片' } },
  { kind: 'audio', label: { en: 'Audio', zhHans: '音频' } },
  { kind: 'video', label: { en: 'Video', zhHans: '视频' } },
  { kind: 'mascot', label: { en: 'Mascot', zhHans: '吉祥物' } },
  { kind: 'panel', label: { en: 'Panel', zhHans: '面板' } },
  { kind: 'group', label: { en: 'Group', zhHans: '组合' }, isMvp: false },
  { kind: 'dialogue', label: { en: 'Dialogue', zhHans: '对话' } },
  { kind: 'vocabulary', label: { en: 'Vocabulary', zhHans: '生词' } },
  { kind: 'quiz', label: { en: 'Quiz mount', zhHans: '题目挂载' } },
  { kind: 'button', label: { en: 'Button', zhHans: '按钮' } },
  { kind: 'hotspot', label: { en: 'Hotspot', zhHans: '热点' } },
  { kind: 'pinyinChart', label: { en: 'Pinyin chart', zhHans: '拼音图表' } },
])

export const actionRegistry = z.array(ActionRegistryItemSchema).parse([
  { kind: 'show', label: { en: 'Show', zhHans: '显示' } },
  { kind: 'hide', label: { en: 'Hide', zhHans: '隐藏' } },
  { kind: 'highlight', label: { en: 'Highlight', zhHans: '高亮' } },
  { kind: 'playAudio', label: { en: 'Play audio', zhHans: '播放音频' } },
  { kind: 'speak', label: { en: 'Mascot speaks', zhHans: '吉祥物讲解' } },
  { kind: 'pause', label: { en: 'Pause', zhHans: '暂停' } },
  { kind: 'wait', label: { en: 'Wait', zhHans: '等待' } },
  {
    kind: 'pauseUntilInteraction',
    label: { en: 'Pause for interaction', zhHans: '等待互动' },
  },
  { kind: 'setState', label: { en: 'Set state', zhHans: '设置状态' } },
  {
    kind: 'emitLearningEvent',
    label: { en: 'Emit learning event', zhHans: '记录学习事件' },
  },
  { kind: 'move', label: { en: 'Move', zhHans: '移动' }, isMvp: false },
  { kind: 'animate', label: { en: 'Animate', zhHans: '动画' }, isMvp: false },
])

export const interactionRegistry = z.array(InteractionRegistryItemSchema).parse([
  { kind: 'multipleChoice', label: { en: 'Multiple choice', zhHans: '选择题' } },
  { kind: 'matching', label: { en: 'Matching', zhHans: '配对' } },
  { kind: 'ordering', label: { en: 'Ordering', zhHans: '排序' } },
  { kind: 'cloze', label: { en: 'Cloze', zhHans: '填空' } },
  { kind: 'dictation', label: { en: 'Dictation', zhHans: '听写' } },
  { kind: 'shortAnswer', label: { en: 'Short answer', zhHans: '短答' } },
  { kind: 'speechRepeat', label: { en: 'Speech repeat', zhHans: '跟读' } },
  { kind: 'rolePlay', label: { en: 'Role play', zhHans: '角色扮演' } },
  { kind: 'hotspot', label: { en: 'Hotspot', zhHans: '点击热点' } },
  { kind: 'dragDrop', label: { en: 'Drag and drop', zhHans: '拖拽' } },
  { kind: 'swipe', label: { en: 'Swipe cards', zhHans: '滑动卡片' } },
  {
    kind: 'boundedChat',
    label: { en: 'Bounded chat', zhHans: '受控对话' },
    isMvp: false,
  },
])

export const courseStudioRegistry = {
  elements: elementRegistry,
  actions: actionRegistry,
  interactions: interactionRegistry,
}
