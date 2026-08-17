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
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Generate one scene or a complete draft sequence. Every result remains editable.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scene">
          <TabsList>
            <TabsTrigger value="scene">Scene</TabsTrigger>
            <TabsTrigger value="lesson">Lesson</TabsTrigger>
          </TabsList>

          <TabsContent value="scene">
            <div className="grid gap-2 sm:grid-cols-3">
              {sceneTemplates.map((template) => {
                const Icon = templateIcons[template.id]
                return (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto min-h-40 flex-col items-start justify-between whitespace-normal p-4 text-left"
                    onClick={() => onPick(template.id)}
                  >
                    <Icon />
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold">{template.title}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {template.description}
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
                    <h3 className="text-sm font-semibold">Four tones foundation</h3>
                    <p className="text-sm text-muted-foreground">
                      A guided sequence from tone overview through a final listening checkpoint.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">6 scenes</Badge>
              </div>

              <ol className="grid gap-x-4 border-y border-border py-2 sm:grid-cols-2">
                {pinyinLessonBlueprint.map((step, index) => (
                  <li key={step.key} className="flex items-center gap-3 py-2 text-sm">
                    <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{step.title.en}</span>
                  </li>
                ))}
              </ol>

              <div className="flex justify-end">
                <Button onClick={onGeneratePinyinLesson}>
                  <ListChecks data-icon="inline-start" />
                  Generate lesson
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
