import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type {
  CourseStudioProject,
  CourseStudioSceneRecord,
} from '../scene-schema/project-schema'
import type {
  LearningProgressSummary,
  SceneProgressById,
} from '../renderer/learning-progress'
import { readText } from './studio-project'

type OutlinePanelProps = {
  project: CourseStudioProject
  selectedSceneId: string
  progressBySceneId: SceneProgressById
  learningSummary: LearningProgressSummary
  onSelectScene: (sceneId: string) => void
  onCreateScene: (sectionId: string) => void
  onDuplicateScene: (scene: CourseStudioSceneRecord) => void
  onDeleteScene: (scene: CourseStudioSceneRecord) => void
}

export function OutlinePanel({
  project,
  selectedSceneId,
  progressBySceneId,
  learningSummary,
  onSelectScene,
  onCreateScene,
  onDuplicateScene,
  onDeleteScene,
}: OutlinePanelProps) {
  const locale = project.defaultLocale

  return (
    <aside className="flex min-h-0 min-w-0 max-w-full flex-col border-b border-border bg-card lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">课程结构</p>
          <h2 className="truncate text-sm font-semibold">
            {readText(project.course.title, locale)}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="outline">
            {learningSummary.completedScenes}/{project.scenes.length} 已完成
          </Badge>
          {learningSummary.reviewItems.length > 0 ? (
            <Badge variant="destructive">
              {learningSummary.reviewItems.length} 待复习
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-3 pb-4">
        {project.units
          .toSorted((a, b) => a.sortOrder - b.sortOrder)
          .map((unit) => {
            const unitProgress = learningSummary.unitProgress.find(
              (progress) => progress.unitId === unit.id,
            )

            return (
              <section key={unit.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        单元 {unit.unitNo}
                      </p>
                      <h3 className="truncate text-sm font-medium">
                        {readText(unit.title, locale)}
                      </h3>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {unitProgress?.completedScenes ?? 0}/
                      {unitProgress?.totalScenes ?? 0}
                    </span>
                  </div>
                  <Progress
                    value={unitProgress?.completionPercent ?? 0}
                    aria-label={`单元 ${unit.unitNo} 完成进度`}
                    className="gap-0"
                  />
                </div>

                {project.sections
                  .filter((section) => section.unitId === unit.id)
                  .toSorted((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => {
                    const scenes = project.scenes
                      .filter((scene) => scene.sectionId === section.id)
                      .toSorted((a, b) => a.sortOrder - b.sortOrder)

                    return (
                      <div key={section.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2 px-1 py-1">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">
                            {readText(section.title, locale)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getSectionKindLabel(section.sectionKind)}
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`在${readText(section.title, locale)}中新增场景`}
                                onClick={() => onCreateScene(section.id)}
                              />
                            }
                          >
                            <Plus />
                          </TooltipTrigger>
                          <TooltipContent>新增场景</TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="flex flex-col gap-0.5">
                          {scenes.map((scene, index) => {
                            const selected = scene.id === selectedSceneId
                            const status =
                              progressBySceneId[scene.id]?.status ?? 'notStarted'

                          return (
                            <div
                              key={scene.id}
                              className="group/scene grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1"
                            >
                              <Button
                                variant={selected ? 'secondary' : 'ghost'}
                                className="h-auto min-h-9 min-w-0 justify-start px-2 py-1.5"
                                onClick={() => onSelectScene(scene.id)}
                              >
                                <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <SceneStatusIcon status={status} />
                                <span className="truncate">{readText(scene.title, locale)}</span>
                              </Button>

                              <div className="hidden items-center group-hover/scene:flex group-focus-within/scene:flex">
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`复制${readText(scene.title, locale)}`}
                                        onClick={() => onDuplicateScene(scene)}
                                      />
                                    }
                                  >
                                    <Copy />
                                  </TooltipTrigger>
                                  <TooltipContent>复制场景</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`删除${readText(scene.title, locale)}`}
                                        disabled={project.scenes.length === 1}
                                        onClick={() => onDeleteScene(scene)}
                                      />
                                    }
                                  >
                                    <Trash2 />
                                  </TooltipTrigger>
                                  <TooltipContent>删除场景</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          )
                          })}
                      </div>
                      </div>
                    )
                  })}
              </section>
            )
          })}

        {learningSummary.reviewItems.length > 0 ? (
          <section className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  复习队列
                </p>
                <h3 className="text-sm font-medium">最近错题</h3>
              </div>
              <Badge variant="destructive">
                {learningSummary.reviewItems.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              {learningSummary.reviewItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.sceneId === selectedSceneId ? 'secondary' : 'ghost'}
                  className="h-auto min-h-11 justify-start px-2 py-2 text-left"
                  onClick={() => onSelectScene(item.sceneId)}
                >
                    <AlertTriangle className="shrink-0 text-destructive" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {item.prompt
                        ? readText(item.prompt, locale)
                        : item.interactionId}
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {readText(item.sceneTitle, locale)}
                      {item.knowledgeRefs[0]
                        ? `, ${item.knowledgeRefs[0].label ? readText(item.knowledgeRefs[0].label, locale) : item.knowledgeRefs[0].refId}`
                        : ''}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  )
}

function SceneStatusIcon({
  status,
}: {
  status: 'notStarted' | 'inProgress' | 'completed'
}) {
  if (status === 'completed') {
    return (
      <CheckCircle2
        data-icon="inline-start"
        className="text-primary"
        aria-hidden
      />
    )
  }
  if (status === 'inProgress') {
    return (
      <Clock3
        data-icon="inline-start"
        className="text-muted-foreground"
        aria-hidden
      />
    )
  }
  return <Circle data-icon="inline-start" aria-hidden />
}

function getSectionKindLabel(kind: CourseStudioProject['sections'][number]['sectionKind']) {
  const labels: Record<typeof kind, string> = {
    objectives: '学习目标',
    text: '课文',
    vocabulary: '生词',
    grammar: '语法',
    pronunciation: '语音',
    characters: '汉字',
    exercise: '练习',
    activity: '活动',
    summary: '总结',
    culture: '文化',
  }
  return labels[kind]
}
