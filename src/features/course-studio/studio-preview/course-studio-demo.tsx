'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Boxes, FileJson, Layers, PlayCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CourseStudioProject } from '@/features/course-studio/scene-schema/project-schema'
import type { LocalizedText } from '@/features/course-studio/scene-schema/shared'
import { ScenePlayer } from '../renderer/scene-player'

type RegistrySummary = {
  elements: number
  actions: number
  interactions: number
}

type CourseStudioDemoProps = {
  project: CourseStudioProject
  registrySummary: RegistrySummary
}

export function CourseStudioDemo({
  project,
  registrySummary,
}: CourseStudioDemoProps) {
  const [selectedSceneId, setSelectedSceneId] = useState(
    project.settings.activeSceneId ?? project.scenes[0]?.id,
  )

  const selectedScene = useMemo(
    () => project.scenes.find((scene) => scene.id === selectedSceneId) ?? project.scenes[0],
    [project.scenes, selectedSceneId],
  )

  const selectedSection = useMemo(
    () =>
      selectedScene
        ? project.sections.find((section) => section.id === selectedScene.sectionId)
        : undefined,
    [project.sections, selectedScene],
  )

  const groupedScenes = useMemo(
    () =>
      project.sections.map((section) => ({
        section,
        scenes: [...project.scenes]
          .filter((scene) => scene.sectionId === section.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      })),
    [project.scenes, project.sections],
  )

  if (!selectedScene) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">No sample scenes found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)]">
        <header className="border-b border-border bg-card px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                HSKWise Course Studio
              </p>
              <h1 className="truncate text-xl font-semibold">
                {readText(project.title, project.defaultLocale)}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <SummaryPill icon={Layers} label="Scenes" value={String(project.scenes.length)} />
              <SummaryPill
                icon={Boxes}
                label="Elements"
                value={String(registrySummary.elements)}
              />
              <SummaryPill
                icon={PlayCircle}
                label="Interactions"
                value={String(registrySummary.interactions)}
              />
            </div>
          </div>
        </header>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="flex min-h-0 flex-col gap-4 border-b border-border bg-card p-4 lg:border-b-0 lg:border-r">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Outline
              </p>
              <h2 className="text-sm font-semibold">
                {readText(project.course.title, project.defaultLocale)}
              </h2>
            </div>

            <div className="flex min-h-0 flex-col gap-4 overflow-auto">
              {groupedScenes.map(({ section, scenes }) => (
                <section key={section.id} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {section.sectionKind}
                    </p>
                    <h3 className="text-sm font-semibold">
                      {readText(section.title, project.defaultLocale)}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1">
                    {scenes.map((scene) => {
                      const isSelected = scene.id === selectedScene.id

                      return (
                        <Button
                          key={scene.id}
                          variant={isSelected ? 'secondary' : 'ghost'}
                          className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                          onClick={() => setSelectedSceneId(scene.id)}
                        >
                          <FileJson data-icon="inline-start" />
                          <span className="min-w-0 truncate">
                            {readText(scene.title, project.defaultLocale)}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          <section className="min-w-0 overflow-auto p-4 lg:p-5">
            <ScenePlayer
              key={selectedScene.id}
              scene={selectedScene.sceneData}
              sceneId={selectedScene.id}
              context="learner"
              title={readText(selectedScene.title, project.defaultLocale)}
              locale={project.defaultLocale}
              assets={project.mockAssets}
            />
          </section>

          <aside className="hidden min-h-0 flex-col gap-4 border-l border-border bg-card p-4 xl:flex">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Inspector
              </p>
              <h2 className="text-sm font-semibold">
                {readText(selectedScene.title, project.defaultLocale)}
              </h2>
            </div>

            <InspectorSection title="Scene">
              <InfoRow label="Kind" value={selectedScene.sceneKind} />
              <InfoRow label="Status" value={selectedScene.status} />
              <InfoRow label="Origin" value={selectedScene.contentOrigin} />
              <InfoRow
                label="Section"
                value={
                  selectedSection
                    ? readText(selectedSection.title, project.defaultLocale)
                    : 'Unknown'
                }
              />
            </InspectorSection>

            <InspectorSection title="Data">
              <InfoRow label="Elements" value={String(selectedScene.sceneData.elements.length)} />
              <InfoRow label="Actions" value={String(selectedScene.sceneData.actions.length)} />
              <InfoRow label="Timeline" value={String(selectedScene.sceneData.timeline.length)} />
              <InfoRow
                label="Interactions"
                value={String(selectedScene.sceneData.interactions.length)}
              />
            </InspectorSection>

            <InspectorSection title="Mock assets">
              <div className="flex flex-col gap-2">
                {project.mockAssets.map((asset) => (
                  <div key={asset.id} className="rounded-md border border-border p-2">
                    <p className="truncate text-xs font-medium">
                      {readText(asset.label, project.defaultLocale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asset.kind} / {asset.status}
                    </p>
                  </div>
                ))}
              </div>
            </InspectorSection>
          </aside>
        </div>
      </div>
    </main>
  )
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  )
}

function InspectorSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
      <h3 className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}

function readText(value: LocalizedText, locale: string) {
  return value[locale] ?? value.en ?? value.zhHans ?? Object.values(value)[0] ?? ''
}
