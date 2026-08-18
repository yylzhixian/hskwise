'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpenText,
  Download,
  FileUp,
  Film,
  Library,
  LayoutTemplate,
  ListTree,
  MonitorPlay,
  MoreHorizontal,
  Pencil,
  Redo2,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import {
  SceneProgressStoreSchema,
  type SceneProgress,
  type SceneProgressStore,
} from '../scene-schema/runtime-schema'
import { createPinyinLessonDraft } from '../templates/pinyin-lesson-template'
import { createStableId, createSceneFromTemplate, duplicateScene, getSceneIssues, parseImportedScene, readText, type SceneTemplateId } from './studio-project'
import { InspectorPanel } from './inspector-panel'
import { OutlinePanel } from './outline-panel'
import {
  CourseStudioProvider,
  type StudioSaveStatus,
  useCourseStudioDocument,
} from './studio-document'
import { TemplatePicker } from './template-picker'
import { TimelinePanel } from './timeline-panel'

type CourseStudioShellProps = {
  initialProject: CourseStudioProject
}

type StudioMode = 'structure' | 'content' | 'timeline' | 'preview'

export function CourseStudioShell({ initialProject }: CourseStudioShellProps) {
  return (
    <CourseStudioProvider initialProject={initialProject}>
      <CourseStudioWorkspace />
    </CourseStudioProvider>
  )
}

function CourseStudioWorkspace() {
  const {
    project,
    saveStatus,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    commitProject,
    flushPendingHistory,
    undo,
    redo,
  } = useCourseStudioDocument()
  const importInputRef = useRef<HTMLInputElement>(null)
  const progressPersistenceReadyRef = useRef(false)
  const [progressStore, setProgressStore] = useState<SceneProgressStore>({})
  const [progressReady, setProgressReady] = useState(false)
  const [mode, setMode] = useState<StudioMode>('content')
  const [previewContext, setPreviewContext] = useState<'editor' | 'learner'>(
    project.settings.previewMode,
  )
  const [selectedSceneId, setSelectedSceneId] = useState(
    project.settings.activeSceneId ?? project.scenes[0]?.id,
  )
  const [selectedElementId, setSelectedElementId] = useState<string | null>(() => {
    const initialScene = project.scenes.find(
      (scene) => scene.id === project.settings.activeSceneId,
    ) ?? project.scenes[0]
    return initialScene?.sceneData.elements[0]?.id ?? null
  })
  const [templateSectionId, setTemplateSectionId] = useState<string | null>(null)
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<CourseStudioSceneRecord | null>(null)
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
        previewContext,
      ),
    [previewContext, progressStore, project],
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
        const storedProgress = window.localStorage.getItem(
          courseStudioProgressStorageKey,
        )
        if (storedProgress) {
          const result = parseStoredProgress(storedProgress)
          if (result.success) setProgressStore(result.data)
        }
      } catch (error) {
        console.error('Course Studio progress restore failed.', error)
      } finally {
        progressPersistenceReadyRef.current = true
        setProgressReady(true)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!progressPersistenceReadyRef.current || !progressReady) return
    const timer = window.setTimeout(() => {
      try {
        const validated = SceneProgressStoreSchema.parse(progressStore)
        window.localStorage.setItem(
          courseStudioProgressStorageKey,
          JSON.stringify(validated),
        )
      } catch (error) {
        console.error('Course Studio progress save failed.', error)
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [progressReady, progressStore])

  useEffect(() => {
    function handleHistoryShortcut(event: KeyboardEvent) {
      if (event.isComposing || event.defaultPrevented) return
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      const withCommand = event.metaKey || event.ctrlKey
      if (!withCommand) return
      const key = event.key.toLowerCase()
      if (event.ctrlKey && !event.metaKey && key === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (key !== 'z') return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }

    window.addEventListener('keydown', handleHistoryShortcut)
    return () => window.removeEventListener('keydown', handleHistoryShortcut)
  }, [redo, undo])

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
    flushPendingHistory()
    setSelectedSceneId(sceneId)
    setSelectedElementId(nextScene?.sceneData.elements[0]?.id ?? null)
  }, [flushPendingHistory, project.scenes])

  const changeScene = useCallback((nextScene: CourseStudioSceneRecord) => {
    commitProject(
      (current) => ({
        ...current,
        scenes: current.scenes.map((scene) =>
          scene.id === nextScene.id ? nextScene : scene,
        ),
      }),
      {
        label: '编辑场景',
        source: mode === 'timeline' ? 'timeline' : 'inspector',
        mergeKey: `scene:${nextScene.id}`,
      },
    )
  }, [commitProject, mode])

  function createScene(templateId: SceneTemplateId) {
    if (!templateSectionId) return
    const scene = createSceneFromTemplate(project, templateSectionId, templateId)
    commitProject(
      (current) => ({ ...current, scenes: [...current.scenes, scene] }),
      { label: '新增场景', source: 'outline' },
    )
    setSelectedSceneId(scene.id)
    setSelectedElementId(scene.sceneData.elements[0]?.id ?? null)
    setTemplateSectionId(null)
  }

  function copyScene(source: CourseStudioSceneRecord) {
    const scene = duplicateScene(project, source)
    const copiedRefs = project.mockKnowledgeRefs
      .filter((ref) => ref.sceneId === source.id)
      .map((ref) => ({ ...structuredClone(ref), id: createStableId('ref'), sceneId: scene.id }))

    commitProject(
      (current) => ({
        ...current,
        scenes: [...current.scenes, scene],
        mockKnowledgeRefs: [...current.mockKnowledgeRefs, ...copiedRefs],
      }),
      { label: '复制场景', source: 'outline' },
    )
    setSelectedSceneId(scene.id)
    setSelectedElementId(scene.sceneData.elements[0]?.id ?? null)
  }

  function generatePinyinLesson() {
    if (!templateSectionId) return
    const draft = createPinyinLessonDraft(project, templateSectionId)
    const firstScene = draft.scenes[0]
    if (!firstScene) return

    commitProject(
      (current) => ({
        ...current,
        scenes: [...current.scenes, ...draft.scenes],
        mockAssets: [...current.mockAssets, ...draft.assets],
        mockKnowledgeRefs: [...current.mockKnowledgeRefs, ...draft.knowledgeRefs],
      }),
      { label: '生成拼音课草稿', source: 'outline' },
    )
    setSelectedSceneId(firstScene.id)
    setSelectedElementId(firstScene.sceneData.elements[0]?.id ?? null)
    setTemplateSectionId(null)
  }

  function changeAsset(nextAsset: CourseStudioProject['mockAssets'][number]) {
    commitProject(
      (current) => ({
        ...current,
        mockAssets: current.mockAssets.map((asset) =>
          asset.id === nextAsset.id ? nextAsset : asset,
        ),
      }),
      { label: '更新素材', source: 'assets' },
    )
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

      commitProject(
        (current) => {
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
        },
        { label: '回填音频时长', source: 'system' },
      )
    },
    [commitProject, selectedSceneId],
  )

  function deletePendingScene() {
    if (!pendingDelete || project.scenes.length === 1) return
    const remainingScenes = project.scenes.filter((scene) => scene.id !== pendingDelete.id)
    const nextScene = remainingScenes.find((scene) => scene.sectionId === pendingDelete.sectionId) ?? remainingScenes[0]

    commitProject(
      (current) => ({
        ...current,
        scenes: current.scenes.filter((scene) => scene.id !== pendingDelete.id),
        mockKnowledgeRefs: current.mockKnowledgeRefs.filter(
          (ref) => ref.sceneId !== pendingDelete.id,
        ),
      }),
      { label: '删除场景', source: 'outline' },
    )
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
    commitProject(
      (current) => ({
        ...current,
        mockKnowledgeRefs: [...current.mockKnowledgeRefs, ref],
      }),
      { label: '绑定知识点', source: 'inspector' },
    )
  }

  function removeKnowledge(refId: string) {
    commitProject(
      (current) => ({
        ...current,
        mockKnowledgeRefs: current.mockKnowledgeRefs.filter(
          (ref) => ref.id !== refId,
        ),
      }),
      { label: '移除知识点', source: 'inspector' },
    )
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
        setImportError(result.error.issues[0]?.message ?? '场景文件格式无效。')
        return
      }
      commitProject(
        (current) => ({
          ...current,
          scenes: current.scenes.map((scene) =>
            scene.id === selectedScene.id
              ? { ...scene, sceneData: result.data }
              : scene,
          ),
        }),
        { label: '导入场景 JSON', source: 'import' },
      )
      setProgressStore((current) =>
        removeSceneProgress(current, project.id, selectedScene.id),
      )
      setScenePlayerVersions((current) => ({
        ...current,
        [selectedScene.id]: (current[selectedScene.id] ?? 0) + 1,
      }))
      setImportError(null)
    } catch {
      setImportError('所选文件不是有效的 JSON。')
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  if (!selectedScene) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">当前课程还没有可编辑的场景。</p>
      </main>
    )
  }

  return (
    <TooltipProvider>
      <main className="min-h-dvh min-w-0 overflow-x-hidden bg-background text-foreground xl:h-dvh xl:overflow-hidden">
        <div className="grid min-h-dvh min-w-0 max-w-full grid-rows-[auto_minmax(0,1fr)] overflow-x-hidden xl:h-dvh">
          <header className="w-full min-w-0 max-w-full overflow-hidden border-b border-border bg-card">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BookOpenText aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">课程工作室</p>
                  <h1 className="truncate text-base font-semibold">
                    {readText(project.title, project.defaultLocale)}
                  </h1>
                </div>
              </div>

              <div className="flex w-full min-w-0 max-w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="撤销"
                        disabled={!canUndo}
                        onClick={undo}
                      />
                    }
                  >
                    <Undo2 />
                  </TooltipTrigger>
                  <TooltipContent>
                    {undoLabel ? `撤销：${undoLabel}` : '撤销'} · ⌘Z
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="重做"
                        disabled={!canRedo}
                        onClick={redo}
                      />
                    }
                  >
                    <Redo2 />
                  </TooltipTrigger>
                  <TooltipContent>
                    {redoLabel ? `重做：${redoLabel}` : '重做'} · ⇧⌘Z
                  </TooltipContent>
                </Tooltip>
                <Badge
                  variant={saveStatus === 'error' ? 'destructive' : 'outline'}
                  aria-label={getSaveLabel(saveStatus)}
                >
                  <Save data-icon="inline-start" />
                  <span className="hidden sm:inline">{getSaveLabel(saveStatus)}</span>
                </Badge>
                <Button
                  variant={errorCount > 0 ? 'destructive' : 'ghost'}
                  size="sm"
                  aria-label={errorCount > 0 ? `${errorCount} 个阻断问题` : '检查通过'}
                  onClick={() => setMode('preview')}
                >
                  <ShieldCheck data-icon="inline-start" />
                  <span className="hidden sm:inline">
                    {errorCount > 0 ? `${errorCount} 个阻断问题` : '检查通过'}
                  </span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setTemplateSectionId(selectedScene.sectionId)}
                >
                  <LayoutTemplate data-icon="inline-start" />
                  新增场景
                </Button>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="更多操作"
                        onClick={() => setToolsOpen(true)}
                      />
                    }
                  >
                    <MoreHorizontal />
                  </TooltipTrigger>
                  <TooltipContent>导入、导出与素材</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2">
              <Tabs
                className="min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                value={mode}
                onValueChange={(value) => setMode(value as StudioMode)}
              >
                <TabsList className="min-w-max" aria-label="课程编辑模式">
                  <TabsTrigger value="structure">
                    <ListTree />
                    课程结构
                  </TabsTrigger>
                  <TabsTrigger value="content">
                    <SlidersHorizontal />
                    内容编辑
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Film />
                    动画时间轴
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <MonitorPlay />
                    预览检查
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {mode === 'preview' ? (
                <div
                  className="flex items-center rounded-md border border-border bg-background p-0.5"
                  role="group"
                  aria-label="预览身份"
                >
                  <Button
                    variant={previewContext === 'editor' ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-pressed={previewContext === 'editor'}
                    onClick={() => setPreviewContext('editor')}
                  >
                    <Pencil data-icon="inline-start" />
                    编辑者
                  </Button>
                  <Button
                    variant={previewContext === 'learner' ? 'secondary' : 'ghost'}
                    size="sm"
                    aria-pressed={previewContext === 'learner'}
                    onClick={() => setPreviewContext('learner')}
                  >
                    <MonitorPlay data-icon="inline-start" />
                    学员
                  </Button>
                </div>
              ) : (
                <p className="hidden text-xs text-muted-foreground md:block">
                  {getModeDescription(mode)}
                </p>
              )}
            </div>
            {importError ? (
              <p className="border-t border-border px-4 py-2 text-xs text-destructive">
                {importError}
              </p>
            ) : null}
          </header>

          <div
            className={
              mode === 'preview'
                ? 'grid min-h-0 grid-cols-1'
                : mode === 'content'
                  ? 'grid min-h-0 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px]'
                  : 'grid min-h-0 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]'
            }
          >
            {mode !== 'preview' ? (
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
            ) : null}

            <section
              className={
                mode === 'timeline'
                  ? 'grid min-h-0 min-w-0 grid-rows-[minmax(260px,0.8fr)_minmax(300px,1.2fr)] overflow-hidden bg-muted/30'
                  : 'min-h-0 min-w-0 overflow-auto bg-muted/30'
              }
            >
              <div className={mode === 'preview' ? 'mx-auto w-full max-w-6xl p-6' : 'min-h-0 overflow-auto p-4'}>
                <ScenePlayer
                  key={`${selectedScene.id}:${previewContext}:${progressReady ? 'ready' : 'loading'}:${scenePlayerVersions[selectedScene.id] ?? 0}`}
                  scene={selectedScene.sceneData}
                  sceneId={selectedScene.id}
                  context={previewContext}
                  title={readText(selectedScene.title, project.defaultLocale)}
                  locale={project.defaultLocale}
                  assets={project.mockAssets}
                  initialProgress={selectedProgress}
                  reviewItems={selectedReviewItems}
                  compact={mode !== 'preview'}
                  currentTimeMs={selectedPlayheadMs}
                  seekVersion={selectedSeekVersion}
                  onCurrentTimeChange={changeSelectedPlayhead}
                  onAudioDurationChange={backfillAudioDuration}
                  onProgressChange={changeSceneProgress}
                />
              </div>

              {mode === 'timeline' ? (
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
              ) : null}
            </section>

            {mode === 'content' ? (
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
            ) : null}
          </div>
        </div>

        <input
          ref={importInputRef}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void importScene(event.target.files?.[0])}
        />

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

        <Dialog open={toolsOpen} onOpenChange={setToolsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>课程工具</DialogTitle>
              <DialogDescription>
                管理当前场景文件和课程素材。JSON 能力仅用于开发调试。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => {
                  setToolsOpen(false)
                  importInputRef.current?.click()
                }}
              >
                <FileUp />
                导入场景
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => {
                  exportSelectedScene()
                  setToolsOpen(false)
                }}
              >
                <Download />
                导出场景
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col py-4"
                onClick={() => {
                  setToolsOpen(false)
                  setAssetLibraryOpen(true)
                }}
              >
                <Library />
                素材库
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>删除这个场景？</DialogTitle>
              <DialogDescription>
                {pendingDelete
                  ? `“${readText(pendingDelete.title, project.defaultLocale)}”及其知识点绑定将从本地草稿中移除。`
                  : '这个场景将从本地草稿中移除。'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
              <Button variant="destructive" onClick={deletePendingScene}>删除场景</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}

function getSaveLabel(status: StudioSaveStatus) {
  switch (status) {
    case 'restored': return '已恢复草稿'
    case 'migrated': return '已迁移草稿'
    case 'saving': return '正在保存'
    case 'saved': return '已保存本地'
    case 'error': return '保存失败'
    case 'sample': return '示例草稿'
  }
}

function getModeDescription(mode: StudioMode) {
  switch (mode) {
    case 'structure': return '组织课节与场景顺序'
    case 'content': return '编辑当前场景的内容与属性'
    case 'timeline': return '安排内容、音频和互动的出现时间'
    case 'preview': return '以学员或编辑者身份检查课程'
  }
}
