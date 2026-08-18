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
    <aside className="flex min-h-0 flex-col border-b border-border bg-card lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Course outline</p>
          <h2 className="truncate text-sm font-semibold">
            {readText(project.course.title, locale)}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="outline">
            {learningSummary.completedScenes}/{project.scenes.length} complete
          </Badge>
          {learningSummary.reviewItems.length > 0 ? (
            <Badge variant="destructive">
              {learningSummary.reviewItems.length} review
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
                        Unit {unit.unitNo}
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
                    aria-label={`Unit ${unit.unitNo} completion`}
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
                          <p className="text-xs text-muted-foreground">{section.sectionKind}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Add scene to ${readText(section.title, locale)}`}
                                onClick={() => onCreateScene(section.id)}
                              />
                            }
                          >
                            <Plus />
                          </TooltipTrigger>
                          <TooltipContent>Add scene</TooltipContent>
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
                                        aria-label={`Duplicate ${readText(scene.title, locale)}`}
                                        onClick={() => onDuplicateScene(scene)}
                                      />
                                    }
                                  >
                                    <Copy />
                                  </TooltipTrigger>
                                  <TooltipContent>Duplicate scene</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`Delete ${readText(scene.title, locale)}`}
                                        disabled={project.scenes.length === 1}
                                        onClick={() => onDeleteScene(scene)}
                                      />
                                    }
                                  >
                                    <Trash2 />
                                  </TooltipTrigger>
                                  <TooltipContent>Delete scene</TooltipContent>
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
                  Review queue
                </p>
                <h3 className="text-sm font-medium">Latest mistakes</h3>
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
                  <AlertTriangle
                    className="size-4 shrink-0 text-destructive"
                    aria-hidden
                  />
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
        className="text-emerald-600 dark:text-emerald-400"
        aria-hidden
      />
    )
  }
  if (status === 'inProgress') {
    return (
      <Clock3
        data-icon="inline-start"
        className="text-amber-600 dark:text-amber-400"
        aria-hidden
      />
    )
  }
  return <Circle data-icon="inline-start" aria-hidden />
}
