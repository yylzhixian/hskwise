import { BookOpenText, Languages, ListChecks, Speech } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { pinyinLessonBlueprint } from '../templates/pinyin-lesson-template'
import { sceneTemplates, type SceneTemplateId } from './studio-project'

type TemplatePickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (templateId: SceneTemplateId) => void
  onGeneratePinyinLesson: () => void
}

const templateIcons = {
  'pinyin-tone': Speech,
  'dialogue-reading': BookOpenText,
  'vocabulary-practice': Languages,
} satisfies Record<SceneTemplateId, typeof Speech>

const templateCopy: Record<SceneTemplateId, { title: string; description: string }> = {
  'pinyin-tone': {
    title: '拼音声调讲解',
    description: '包含教师引导、声调图、音频提示和检查题。',
  },
  'dialogue-reading': {
    title: '对话精读',
    description: '包含短对话、逐句音频、教学提示和口语练习。',
  },
  'vocabulary-practice': {
    title: '生词练习',
    description: '先学习生词卡片，再完成轻量配对练习。',
  },
}

export function TemplatePicker({
  open,
  onOpenChange,
  onPick,
  onGeneratePinyinLesson,
}: TemplatePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择场景模板</DialogTitle>
          <DialogDescription>
            生成单个场景或完整课节草稿，生成后仍可继续编辑。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scene">
          <TabsList>
            <TabsTrigger value="scene">单个场景</TabsTrigger>
            <TabsTrigger value="lesson">完整课节</TabsTrigger>
          </TabsList>

          <TabsContent value="scene">
            <div className="grid gap-2 sm:grid-cols-3">
              {sceneTemplates.map((template) => {
                const Icon = templateIcons[template.id]
                const copy = templateCopy[template.id]
                return (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto min-h-40 flex-col items-start justify-between whitespace-normal p-4 text-left"
                    onClick={() => onPick(template.id)}
                  >
                    <Icon />
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold">{copy.title}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {copy.description}
                      </span>
                    </span>
                  </Button>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="lesson">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <ListChecks className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">四声入门课</h3>
                    <p className="text-sm text-muted-foreground">
                      从四声总览到听辨检查，生成一套循序渐进的教学场景。
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">6 个场景</Badge>
              </div>

              <ol className="grid gap-x-4 border-y border-border py-2 sm:grid-cols-2">
                {pinyinLessonBlueprint.map((step, index) => (
                  <li key={step.key} className="flex items-center gap-3 py-2 text-sm">
                    <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{step.title.zhHans}</span>
                  </li>
                ))}
              </ol>

              <div className="flex justify-end">
                <Button onClick={onGeneratePinyinLesson}>
                  <ListChecks data-icon="inline-start" />
                  生成课节草稿
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
