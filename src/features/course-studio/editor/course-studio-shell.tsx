'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  FileUp,
  Library,
  LayoutTemplate,
  MonitorPlay,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AssetLibrary } from '../assets/asset-library'
import {
  courseStudioProgressStorageKey,
  getContextSceneProgress,
  getProgressStoreKey,
  isSameSceneProgress,
  parseStoredProgress,
  removeSceneProgress,
  summarizeLearningProgress,
} from '../renderer/learning-progress'
import { ScenePlayer } from '../renderer/scene-player'
import type { ResolvedAudioDuration } from '../renderer/use-audio-transport'
import type {
  CourseStudioProject,
  CourseStudioSceneRecord,
  MockKnowledgeRef,
} from '../scene-schema/project-schema'
import { CourseStudioProjectSchema } from '../scene-schema/project-schema'
import {
  SceneProgressStoreSchema,
  type SceneProgress,
  type SceneProgressStore,
} from '../scene-schema/runtime-schema'
import { createPinyinLessonDraft } from '../templates/pinyin-lesson-template'
import { createStableId, createSceneFromTemplate, courseStudioStorageKey, duplicateScene, getSceneIssues, parseImportedScene, parseStoredProject, readText, type SceneTemplateId } from './studio-project'
import { InspectorPanel } from './inspector-panel'
import { OutlinePanel } from './outline-panel'
import { TemplatePicker } from './template-picker'
import { TimelinePanel } from './timeline-panel'

type CourseStudioShellProps = {
  initialProject: CourseStudioProject
}

type SaveStatus = 'sample' | 'restored' | 'saving' | 'saved' | 'error'

export function CourseStudioShell({ initialProject }: CourseStudioShellProps) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const persistenceReadyRef = useRef(false)
  const progressPersistenceReadyRef = useRef(false)
  const [project, setProject] = useState(initialProject)
  const [progressStore, setProgressStore] = useState<SceneProgressStore>({})
  const [progressReady, setProgressReady] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState(
    initialProject.settings.activeSceneId ?? initialProject.scenes[0]?.id,
  )
  const [selectedElementId, setSelectedElementId] = useState<string | null>(() => {
    const initialScene = initialProject.scenes.find(
      (scene) => scene.id === initialProject.settings.activeSceneId,
    ) ?? initialProject.scenes[0]
    return initialScene?.sceneData.elements[0]?.id ?? null
  })
  const [templateSectionId, setTemplateSectionId] = useState<string | null>(null)
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<CourseStudioSceneRecord | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('sample')
  const [importError, setImportError] = useState<string | null>(null)
  const [scenePlayheads, setScenePlayheads] = useState<Record<string, number>>({})
  const [sceneSeekVersions, setSceneSeekVersions] = useState<Record<string, number>>({})
  const [scenePlayerVersions, setScenePlayerVersions] = useState<Record<string, number>>({})

  const selectedScene = useMemo(
    () => project.scenes.find((scene) => scene.id === selectedSceneId) ?? project.scenes[0],
    [project.scenes, selectedSceneId],
  )
  const issues = useMemo(
    () => selectedScene ? getSceneIssues(project, selectedScene) : [],
    [project, selectedScene],
  )
  const errorCount = issues.filter((issue) => issue.severity === 'error').length
  const selectedSeekVersion = sceneSeekVersions[selectedScene?.id ?? ''] ?? 0
  const progressBySceneId = useMemo(
    () =>
      getContextSceneProgress(
        project,
        progressStore,
        project.settings.previewMode,
      ),
    [progressStore, project],
  )
  const learningSummary = useMemo(
    () => summarizeLearningProgress(project, progressBySceneId),
    [progressBySceneId, project],
  )
  const selectedProgress = selectedScene
    ? progressBySceneId[selectedScene.id]
    : undefined
  const selectedPlayheadMs = selectedScene
    ? (scenePlayheads[selectedScene.id] ?? selectedProgress?.maxPlayedTimeMs ?? 0)
    : 0
  const selectedReviewItems = selectedScene
    ? learningSummary.reviewItems.filter(
        (item) => item.sceneId === selectedScene.id,
      )
    : []

  const changeSelectedPlayhead = useCallback(
    (playheadMs: number) => {
      if (!selectedScene) return
      setScenePlayheads((current) => ({
        ...current,
        [selectedScene.id]: playheadMs,
      }))
    },
    [selectedScene],
  )

  const seekSelectedPlayhead = useCallback(
    (playheadMs: number) => {
      if (!selectedScene) return
      setScenePlayheads((current) => ({
        ...current,
        [selectedScene.id]: playheadMs,
      }))
      setSceneSeekVersions((current) => ({
        ...current,
        [selectedScene.id]: (current[selectedScene.id] ?? 0) + 1,
      }))
    },
    [selectedScene],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedValue = window.localStorage.getItem(courseStudioStorageKey)
        if (storedValue) {
          const result = parseStoredProject(storedValue)
          if (result.success) {
            const restoredScene = result.data.scenes.find(
              (scene) => scene.id === result.data.settings.activeSceneId,
            ) ?? result.data.scenes[0]
            setProject(result.data)
            setSelectedSceneId(restoredScene?.id)
            setSelectedElementId(restoredScene?.sceneData.elements[0]?.id ?? null)
            setSaveStatus('restored')
          } else {
            setSaveStatus('error')
          }
        }

        const storedProgress = window.localStorage.getItem(
          courseStudioProgressStorageKey,
        )
        if (storedProgress) {
          const result = parseStoredProgress(storedProgress)
          if (result.success) setProgressStore(result.data)
        }
      } catch {
        setSaveStatus('error')
      } finally {
        persistenceReadyRef.current = true
        progressPersistenceReadyRef.current = true
        setProgressReady(true)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!persistenceReadyRef.current) return
    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      try {
        const validated = CourseStudioProjectSchema.parse(project)
        window.localStorage.setItem(courseStudioStorageKey, JSON.stringify(validated))
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [project])

  useEffect(() => {
    if (!progressPersistenceReadyRef.current || !progressReady) return
    const timer = window.setTimeout(() => {
      try {
        const validated = SceneProgressStoreSchema.parse(progressStore)
        window.localStorage.setItem(
          courseStudioProgressStorageKey,
          JSON.stringify(validated),
        )
      } catch {
        setSaveStatus('error')
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [progressReady, progressStore])

  const changeSceneProgress = useCallback(
    (nextProgress: SceneProgress) => {
      if (!progressPersistenceReadyRef.current) return
      setProgressStore((current) => {
        const key = getProgressStoreKey(
          project.id,
          nextProgress.context,
          nextProgress.sceneId,
        )
        return isSameSceneProgress(current[key], nextProgress)
          ? current
          : { ...current, [key]: nextProgress }
      })
    },
    [project.id],
  )

  const selectScene = useCallback((sceneId: string) => {
    const nextScene = project.scenes.find((scene) => scene.id === sceneId)
    setSelectedSceneId(sceneId)
    setSelectedElementId(nextScene?.sceneData.elements[0]?.id ?? null)
    setProject((current) => ({
      ...current,
      settings: { ...current.settings, activeSceneId: sceneId },
    }))
  }, [project.scenes])

  const changeScene = useCallback((nextScene: CourseStudioSceneRecord) => {
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.id === nextScene.id ? nextScene : scene),
    }))
  }, [])

  function createScene(templateId: SceneTemplateId) {
    if (!templateSectionId) return
    const scene = createSceneFromTemplate(project, templateSectionId, templateId)
    setProject((current) => ({
      ...current,
      scenes: [...current.scenes, scene],
      settings: { ...current.settings, activeSceneId: scene.id },
    }))
    setSelectedSceneId(scene.id)
    setSelectedElementId(scene.sceneData.elements[0]?.id ?? null)
    setTemplateSectionId(null)
  }

  function copyScene(source: CourseStudioSceneRecord) {
    const scene = duplicateScene(project, source)
    const copiedRefs = project.mockKnowledgeRefs
      .filter((ref) => ref.sceneId === source.id)
      .map((ref) => ({ ...structuredClone(ref), id: createStableId('ref'), sceneId: scene.id }))

    setProject((current) => ({
      ...current,
      scenes: [...current.scenes, scene],
      mockKnowledgeRefs: [...current.mockKnowledgeRefs, ...copiedRefs],
      settings: { ...current.settings, activeSceneId: scene.id },
    }))
    setSelectedSceneId(scene.id)
    setSelectedElementId(scene.sceneData.elements[0]?.id ?? null)
  }

  function generatePinyinLesson() {
    if (!templateSectionId) return
    const draft = createPinyinLessonDraft(project, templateSectionId)
    const firstScene = draft.scenes[0]
    if (!firstScene) return

    setProject((current) => ({
      ...current,
      scenes: [...current.scenes, ...draft.scenes],
      mockAssets: [...current.mockAssets, ...draft.assets],
      mockKnowledgeRefs: [...current.mockKnowledgeRefs, ...draft.knowledgeRefs],
      settings: { ...current.settings, activeSceneId: firstScene.id },
    }))
    setSelectedSceneId(firstScene.id)
    setSelectedElementId(firstScene.sceneData.elements[0]?.id ?? null)
    setTemplateSectionId(null)
  }

  function changeAsset(nextAsset: CourseStudioProject['mockAssets'][number]) {
    setProject((current) => ({
      ...current,
      mockAssets: current.mockAssets.map((asset) =>
        asset.id === nextAsset.id ? nextAsset : asset,
      ),
    }))
  }

  const backfillAudioDuration = useCallback(
    ({
      actionId,
      assetId,
      durationMs,
      assetDurationMs,
    }: ResolvedAudioDuration) => {
      if (!selectedSceneId) return
      const normalizedClipDuration = Math.max(1, Math.round(durationMs))
      const normalizedAssetDuration = Math.max(1, Math.round(assetDurationMs))

      setProject((current) => {
        let changed = false
        const mockAssets = current.mockAssets.map((asset) => {
          if (!assetId || asset.id !== assetId) return asset
          if (asset.durationMs === normalizedAssetDuration) return asset
          changed = true
          return { ...asset, durationMs: normalizedAssetDuration }
        })
        const scenes = current.scenes.map((scene) => {
          if (scene.id !== selectedSceneId) return scene
          let timelineChanged = false
          const timeline = scene.sceneData.timeline.map((step) => {
            if (step.actionId !== actionId || step.durationMs !== undefined) {
              return step
            }
            changed = true
            timelineChanged = true
            return { ...step, durationMs: normalizedClipDuration }
          })
          return timelineChanged
            ? { ...scene, sceneData: { ...scene.sceneData, timeline } }
            : scene
        })

        return changed ? { ...current, mockAssets, scenes } : current
      })
    },
    [selectedSceneId],
  )

  function deletePendingScene() {
    if (!pendingDelete || project.scenes.length === 1) return
    const remainingScenes = project.scenes.filter((scene) => scene.id !== pendingDelete.id)
    const nextScene = remainingScenes.find((scene) => scene.sectionId === pendingDelete.sectionId) ?? remainingScenes[0]

    setProject((current) => ({
      ...current,
      scenes: current.scenes.filter((scene) => scene.id !== pendingDelete.id),
      mockKnowledgeRefs: current.mockKnowledgeRefs.filter((ref) => ref.sceneId !== pendingDelete.id),
      settings: { ...current.settings, activeSceneId: nextScene.id },
    }))
    setSelectedSceneId(nextScene.id)
    setSelectedElementId(nextScene.sceneData.elements[0]?.id ?? null)
    setProgressStore((current) =>
      removeSceneProgress(current, project.id, pendingDelete.id),
    )
    setPendingDelete(null)
  }

  function addKnowledge(candidate: Pick<MockKnowledgeRef, 'refType' | 'refId' | 'refRole' | 'label'>) {
    if (!selectedScene) return
    const ref: MockKnowledgeRef = {
      ...candidate,
      id: createStableId('ref'),
      sceneId: selectedScene.id,
    }
    setProject((current) => ({
      ...current,
      mockKnowledgeRefs: [...current.mockKnowledgeRefs, ref],
    }))
  }

  function removeKnowledge(refId: string) {
    setProject((current) => ({
      ...current,
      mockKnowledgeRefs: current.mockKnowledgeRefs.filter((ref) => ref.id !== refId),
    }))
  }

  function exportSelectedScene() {
    if (!selectedScene) return
    const blob = new Blob([JSON.stringify(selectedScene.sceneData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${selectedScene.id}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function importScene(file: File | undefined) {
    if (!file || !selectedScene) return
    try {
      const result = parseImportedScene(await file.text())
      if (!result.success) {
        setImportError(result.error.issues[0]?.message ?? 'The scene file is invalid.')
        return
      }
      changeScene({ ...selectedScene, sceneData: result.data })
      setProgressStore((current) =>
        removeSceneProgress(current, project.id, selectedScene.id),
      )
      setScenePlayerVersions((current) => ({
        ...current,
        [selectedScene.id]: (current[selectedScene.id] ?? 0) + 1,
      }))
      setImportError(null)
    } catch {
      setImportError('The selected file is not valid JSON.')
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  if (!selectedScene) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">The project has no editable scenes.</p>
      </main>
    )
  }

  return (
    <TooltipProvider>
      <main className="min-h-dvh bg-background text-foreground xl:h-dvh xl:overflow-hidden">
        <div className="grid min-h-dvh grid-rows-[auto_minmax(0,1fr)] xl:h-dvh">
          <header className="border-b border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">HSKWise Course Studio</p>
                  <h1 className="truncate text-base font-semibold">
                    {readText(project.title, project.defaultLocale)}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center rounded-md border border-border bg-background p-0.5"
                  role="group"
                  aria-label="Preview context"
                >
                  <Button
                    variant={project.settings.previewMode === 'editor' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7"
                    aria-pressed={project.settings.previewMode === 'editor'}
                    onClick={() =>
                      setProject((current) => ({
                        ...current,
                        settings: { ...current.settings, previewMode: 'editor' },
                      }))
                    }
                  >
                    <Pencil data-icon="inline-start" />
                    Editor
                  </Button>
                  <Button
                    variant={project.settings.previewMode === 'learner' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7"
                    aria-pressed={project.settings.previewMode === 'learner'}
                    onClick={() =>
                      setProject((current) => ({
                        ...current,
                        settings: { ...current.settings, previewMode: 'learner' },
                      }))
                    }
                  >
                    <MonitorPlay data-icon="inline-start" />
                    Learner
                  </Button>
                </div>
                <Badge variant={saveStatus === 'error' ? 'destructive' : 'outline'}>
                  <Save data-icon="inline-start" />
                  {getSaveLabel(saveStatus)}
                </Badge>
                <Badge variant={errorCount > 0 ? 'destructive' : 'secondary'}>
                  <ShieldCheck data-icon="inline-start" />
                  {errorCount > 0 ? `${errorCount} blockers` : 'Schema valid'}
                </Badge>
                <input
                  ref={importInputRef}
                  className="sr-only"
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => void importScene(event.target.files?.[0])}
                />
                <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
                  <FileUp data-icon="inline-start" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={exportSelectedScene}>
                  <Download data-icon="inline-start" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAssetLibraryOpen(true)}>
                  <Library data-icon="inline-start" />
                  Assets
                </Button>
                <Button size="sm" onClick={() => setTemplateSectionId(selectedScene.sectionId)}>
                  <LayoutTemplate data-icon="inline-start" />
                  Templates
                </Button>
              </div>
            </div>
            {importError ? <p className="mt-2 text-xs text-destructive">{importError}</p> : null}
          </header>

          <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
            <OutlinePanel
              project={project}
              selectedSceneId={selectedScene.id}
              progressBySceneId={progressBySceneId}
              learningSummary={learningSummary}
              onSelectScene={selectScene}
              onCreateScene={setTemplateSectionId}
              onDuplicateScene={copyScene}
              onDeleteScene={setPendingDelete}
            />

            <section className="grid min-h-0 min-w-0 max-w-full grid-rows-[minmax(0,1fr)_auto] overflow-x-hidden bg-muted/30 xl:overflow-hidden">
              <div className="min-h-0 overflow-auto p-4">
                <ScenePlayer
                  key={`${selectedScene.id}:${project.settings.previewMode}:${progressReady ? 'ready' : 'loading'}:${scenePlayerVersions[selectedScene.id] ?? 0}`}
                  scene={selectedScene.sceneData}
                  sceneId={selectedScene.id}
                  context={project.settings.previewMode}
                  title={readText(selectedScene.title, project.defaultLocale)}
                  locale={project.defaultLocale}
                  assets={project.mockAssets}
                  initialProgress={selectedProgress}
                  reviewItems={selectedReviewItems}
                  compact
                  currentTimeMs={selectedPlayheadMs}
                  seekVersion={selectedSeekVersion}
                  onCurrentTimeChange={changeSelectedPlayhead}
                  onAudioDurationChange={backfillAudioDuration}
                  onProgressChange={changeSceneProgress}
                />
              </div>
              <TimelinePanel
                key={selectedScene.id}
                scene={selectedScene.sceneData}
                assets={project.mockAssets}
                locale={project.defaultLocale}
                playheadMs={selectedPlayheadMs}
                onPlayheadChange={seekSelectedPlayhead}
                onChange={(sceneData) =>
                  changeScene({ ...selectedScene, sceneData })
                }
              />
            </section>

            <div className="min-h-0 lg:col-span-2 xl:col-span-1">
              <InspectorPanel
                key={selectedScene.id}
                project={project}
                scene={selectedScene}
                issues={issues}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onChangeScene={changeScene}
                onAddKnowledge={addKnowledge}
                onRemoveKnowledge={removeKnowledge}
              />
            </div>
          </div>
        </div>

        <TemplatePicker
          open={Boolean(templateSectionId)}
          onOpenChange={(open) => { if (!open) setTemplateSectionId(null) }}
          onPick={createScene}
          onGeneratePinyinLesson={generatePinyinLesson}
        />

        {assetLibraryOpen ? (
          <AssetLibrary
            assets={project.mockAssets}
            locale={project.defaultLocale}
            onOpenChange={setAssetLibraryOpen}
            onChangeAsset={changeAsset}
          />
        ) : null}

        <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete scene?</DialogTitle>
              <DialogDescription>
                {pendingDelete
                  ? `${readText(pendingDelete.title, project.defaultLocale)} and its mock knowledge bindings will be removed from this local draft.`
                  : 'This scene will be removed from the local draft.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button variant="destructive" onClick={deletePendingScene}>Delete scene</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}

function getSaveLabel(status: SaveStatus) {
  switch (status) {
    case 'restored': return 'Draft restored'
    case 'saving': return 'Saving locally'
    case 'saved': return 'Saved locally'
    case 'error': return 'Storage error'
    case 'sample': return 'Sample draft'
  }
}
