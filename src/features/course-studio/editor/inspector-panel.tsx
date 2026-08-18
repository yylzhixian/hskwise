import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Link2, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { SceneElement } from '../scene-schema/element-schema'
import {
  courseSceneKindValues,
  type CourseStudioProject,
  type CourseStudioSceneRecord,
  type MockAsset,
  type MockKnowledgeRef,
} from '../scene-schema/project-schema'
import type { SceneData } from '../scene-schema/scene-schema'
import {
  parseImportedScene,
  readText,
  type StudioIssue,
} from './studio-project'

type KnowledgeCandidate = Pick<MockKnowledgeRef, 'refType' | 'refId' | 'refRole' | 'label'>

const knowledgeCatalog: KnowledgeCandidate[] = [
  {
    refType: 'pinyinConcept',
    refId: 'tone_1',
    refRole: 'teaches',
    label: { en: 'First tone', zhHans: '第一声' },
  },
  {
    refType: 'pinyinConcept',
    refId: 'tone_2',
    refRole: 'teaches',
    label: { en: 'Second tone', zhHans: '第二声' },
  },
  {
    refType: 'lexicalItem',
    refId: 'lex_nihao',
    refRole: 'practices',
    label: { en: '你好', zhHans: '你好' },
  },
  {
    refType: 'lexicalItem',
    refId: 'lex_wo',
    refRole: 'teaches',
    label: { en: '我 · I / me', zhHans: '我' },
  },
  {
    refType: 'lexicalItem',
    refId: 'lex_jiao',
    refRole: 'teaches',
    label: { en: '叫 · to be called', zhHans: '叫' },
  },
  {
    refType: 'tag',
    refId: 'skill_speaking',
    refRole: 'practices',
    label: { en: 'Speaking', zhHans: '口语' },
  },
]

const contentOriginValues = [
  'original',
  'licensed',
  'openLicensed',
  'referenceRewrite',
  'referenceOnly',
] as const

const positionPresetValues = [
  'top',
  'center',
  'bottom',
  'left',
  'right',
  'left-top',
  'right-top',
  'left-bottom',
  'right-bottom',
  'full',
] as const

type InspectorPanelProps = {
  project: CourseStudioProject
  scene: CourseStudioSceneRecord
  issues: StudioIssue[]
  selectedElementId: string | null
  onSelectElement: (elementId: string) => void
  onChangeScene: (scene: CourseStudioSceneRecord) => void
  onAddKnowledge: (candidate: KnowledgeCandidate) => void
  onRemoveKnowledge: (refId: string) => void
}

export function InspectorPanel({
  project,
  scene,
  issues,
  selectedElementId,
  onSelectElement,
  onChangeScene,
  onAddKnowledge,
  onRemoveKnowledge,
}: InspectorPanelProps) {
  const locale = project.defaultLocale
  const [knowledgeQuery, setKnowledgeQuery] = useState('')
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(scene.sceneData, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const selectedElement =
    scene.sceneData.elements.find((element) => element.id === selectedElementId) ??
    scene.sceneData.elements[0]
  const sceneRefs = project.mockKnowledgeRefs.filter((ref) => ref.sceneId === scene.id)
  const filteredKnowledge = useMemo(() => {
    const query = knowledgeQuery.trim().toLowerCase()
    if (!query) return knowledgeCatalog
    return knowledgeCatalog.filter((candidate) => {
      const label = candidate.label ? readText(candidate.label, locale) : candidate.refId
      return `${label} ${candidate.refId} ${candidate.refType}`.toLowerCase().includes(query)
    })
  }, [knowledgeQuery, locale])

  function updateSceneData(sceneData: SceneData) {
    onChangeScene({ ...scene, sceneData })
  }

  function updateElement(nextElement: SceneElement) {
    updateSceneData({
      ...scene.sceneData,
      elements: scene.sceneData.elements.map((element) =>
        element.id === nextElement.id ? nextElement : element,
      ),
    })
  }

  function applyJson() {
    try {
      const result = parseImportedScene(jsonDraft)
      if (!result.success) {
        setJsonError(result.error.issues[0]?.message ?? 'Scene JSON is invalid.')
        return
      }
      setJsonError(null)
      updateSceneData(result.data)
    } catch {
      setJsonError('Enter valid JSON before applying changes.')
    }
  }

  return (
    <aside className="flex min-h-0 flex-col border-t border-border bg-card xl:border-l xl:border-t-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Inspector</p>
          <h2 className="truncate text-sm font-semibold">{readText(scene.title, locale)}</h2>
        </div>
        <Badge variant={issues.some((issue) => issue.severity === 'error') ? 'destructive' : 'secondary'}>
          {issues.length} checks
        </Badge>
      </div>

      <Tabs
        defaultValue="scene"
        className="min-h-0 flex-1 gap-0"
        onValueChange={(value) => {
          if (value === 'json') {
            setJsonDraft(JSON.stringify(scene.sceneData, null, 2))
            setJsonError(null)
          }
        }}
      >
        <TabsList variant="line" className="mx-4 grid w-auto grid-cols-4">
          <TabsTrigger value="scene">Scene</TabsTrigger>
          <TabsTrigger value="element">Element</TabsTrigger>
          <TabsTrigger value="checks">Checks</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="scene" className="min-h-0 overflow-auto p-4">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="scene-title">Title</FieldLabel>
              <Input
                id="scene-title"
                value={readText(scene.title, locale)}
                onChange={(event) =>
                  onChangeScene({
                    ...scene,
                    title: { ...scene.title, [locale]: event.target.value },
                  })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Scene kind</FieldLabel>
              <Select
                value={scene.sceneKind}
                onValueChange={(value) =>
                  value && onChangeScene({ ...scene, sceneKind: value as typeof scene.sceneKind })
                }
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courseSceneKindValues.map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Playback</FieldLabel>
                <Select
                  value={scene.sceneData.playback.mode}
                  onValueChange={(value) =>
                    value && updateSceneData({
                      ...scene.sceneData,
                      playback: {
                        ...scene.sceneData.playback,
                        mode: value as SceneData['playback']['mode'],
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>
                    {['guided', 'manual', 'auto'].map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectGroup></SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Canvas</FieldLabel>
                <Select
                  value={scene.sceneData.canvas.aspectRatio}
                  onValueChange={(value) =>
                    value && updateSceneData({
                      ...scene.sceneData,
                      canvas: {
                        ...scene.sceneData.canvas,
                        aspectRatio: value as SceneData['canvas']['aspectRatio'],
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>
                    {['16:9', '4:3', '1:1', '9:16', 'responsive'].map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectGroup></SelectContent>
                </Select>
              </Field>
            </div>

            <FieldGroup className="gap-3">
              <PlaybackSwitch
                id="playback-auto-start"
                label="Auto start"
                checked={scene.sceneData.playback.autoStart}
                onCheckedChange={(autoStart) =>
                  updateSceneData({
                    ...scene.sceneData,
                    playback: { ...scene.sceneData.playback, autoStart },
                  })
                }
              />
              <PlaybackSwitch
                id="playback-allow-pause"
                label="Allow pause"
                checked={scene.sceneData.playback.allowPause}
                onCheckedChange={(allowPause) =>
                  updateSceneData({
                    ...scene.sceneData,
                    playback: { ...scene.sceneData.playback, allowPause },
                  })
                }
              />
              <PlaybackSwitch
                id="playback-allow-replay"
                label="Allow replay"
                checked={scene.sceneData.playback.allowReplay}
                onCheckedChange={(allowReplay) =>
                  updateSceneData({
                    ...scene.sceneData,
                    playback: { ...scene.sceneData.playback, allowReplay },
                  })
                }
              />
            </FieldGroup>

            <Field>
              <FieldLabel>Content origin</FieldLabel>
              <Select
                value={scene.contentOrigin}
                onValueChange={(value) =>
                  value && onChangeScene({
                    ...scene,
                    contentOrigin: value as typeof scene.contentOrigin,
                  })
                }
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {contentOriginValues.map((value) => (
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  ))}
                </SelectGroup></SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="scene-tags">Tags</FieldLabel>
              <Input
                id="scene-tags"
                value={scene.tags.join(', ')}
                onChange={(event) =>
                  onChangeScene({
                    ...scene,
                    tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
                  })
                }
              />
              <FieldDescription>Separate tags with commas.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="scene-duration">Estimated seconds</FieldLabel>
              <Input
                id="scene-duration"
                type="number"
                min={1}
                value={scene.estimatedSeconds ?? 60}
                onChange={(event) =>
                  onChangeScene({
                    ...scene,
                    estimatedSeconds: Math.max(1, Number(event.target.value) || 1),
                  })
                }
              />
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="element" className="min-h-0 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1">
              {scene.sceneData.elements.map((element) => (
                <Button
                  key={element.id}
                  size="xs"
                  variant={element.id === selectedElement?.id ? 'secondary' : 'outline'}
                  onClick={() => onSelectElement(element.id)}
                >
                  {element.kind}
                </Button>
              ))}
            </div>

            {selectedElement ? (
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="element-id">Element ID</FieldLabel>
                  <Input id="element-id" value={selectedElement.id} disabled />
                </Field>

                <Field>
                  <FieldLabel>Layout preset</FieldLabel>
                  <Select
                    value={selectedElement.position?.preset ?? 'center'}
                    onValueChange={(value) =>
                      value && updateElement({
                        ...selectedElement,
                        position: {
                          preset: value as NonNullable<SceneElement['position']>['preset'],
                          zIndex: selectedElement.position?.zIndex,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectGroup>
                      {positionPresetValues.map((value) => (
                        <SelectItem key={value} value={value}>{value}</SelectItem>
                      ))}
                    </SelectGroup></SelectContent>
                  </Select>
                </Field>

                <EditableElementFields
                  element={selectedElement}
                  locale={locale}
                  assets={project.mockAssets}
                  onChange={updateElement}
                />
              </FieldGroup>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="checks" className="min-h-0 overflow-auto p-4">
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold">Pre-publish checks</h3>
                {issues.length === 0 ? <Badge variant="secondary">Ready</Badge> : null}
              </div>
              {issues.length > 0 ? issues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-2 border-b border-border py-2 last:border-b-0">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{issue.title}</p>
                      <Badge variant={issue.severity === 'error' ? 'destructive' : 'outline'}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{issue.detail}</p>
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-2 py-2 text-sm">
                  <CheckCircle2 className="size-4 text-muted-foreground" aria-hidden />
                  No blocking issues found.
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-muted-foreground" aria-hidden />
                <h3 className="text-xs font-semibold">Knowledge bindings</h3>
              </div>

              <div className="flex flex-col gap-1">
                {sceneRefs.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {ref.label ? readText(ref.label, locale) : ref.refId}
                      </p>
                      <p className="text-xs text-muted-foreground">{ref.refType} · {ref.refRole}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${ref.refId}`}
                      onClick={() => onRemoveKnowledge(ref.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>

              <Field>
                <FieldLabel htmlFor="knowledge-search">Find knowledge</FieldLabel>
                <Input
                  id="knowledge-search"
                  type="search"
                  placeholder="Search vocabulary, pinyin, or skills"
                  value={knowledgeQuery}
                  onChange={(event) => setKnowledgeQuery(event.target.value)}
                />
              </Field>
              <div className="flex flex-col gap-1">
                {filteredKnowledge.map((candidate) => {
                  const bound = sceneRefs.some((ref) => ref.refId === candidate.refId)
                  return (
                    <Button
                      key={candidate.refId}
                      variant="ghost"
                      className="justify-start"
                      disabled={bound}
                      onClick={() => onAddKnowledge(candidate)}
                    >
                      <Plus data-icon="inline-start" />
                      <span className="truncate">
                        {candidate.label ? readText(candidate.label, locale) : candidate.refId}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="json" className="min-h-0 overflow-auto p-4">
          <FieldGroup className="gap-3">
            <Field data-invalid={Boolean(jsonError)}>
              <FieldLabel htmlFor="scene-json">SceneData JSON</FieldLabel>
              <Textarea
                id="scene-json"
                className="min-h-80 field-sizing-fixed font-mono text-xs"
                value={jsonDraft}
                aria-invalid={Boolean(jsonError)}
                onChange={(event) => setJsonDraft(event.target.value)}
              />
              {jsonError ? <p className="text-xs text-destructive">{jsonError}</p> : null}
            </Field>
            <Button onClick={applyJson}>Apply validated JSON</Button>
          </FieldGroup>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

function PlaybackSwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      </FieldContent>
      <Switch
        id={id}
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </Field>
  )
}

function EditableElementFields({
  element,
  locale,
  assets,
  onChange,
}: {
  element: SceneElement
  locale: string
  assets: MockAsset[]
  onChange: (element: SceneElement) => void
}) {
  if (element.kind === 'text' || element.kind === 'callout') {
    return (
      <Field>
        <FieldLabel htmlFor="element-content">Content</FieldLabel>
        <Textarea
          id="element-content"
          value={readText(element.content, locale)}
          onChange={(event) =>
            onChange({
              ...element,
              content: { ...element.content, [locale]: event.target.value },
            })
          }
        />
      </Field>
    )
  }

  if (element.kind === 'button') {
    return (
      <Field>
        <FieldLabel htmlFor="element-label">Button label</FieldLabel>
        <Input
          id="element-label"
          value={readText(element.label, locale)}
          onChange={(event) =>
            onChange({ ...element, label: { ...element.label, [locale]: event.target.value } })
          }
        />
      </Field>
    )
  }

  if (element.kind === 'mascot') {
    return (
      <Field>
        <FieldLabel>Expression</FieldLabel>
        <Select
          value={element.expression}
          onValueChange={(value) =>
            value && onChange({
              ...element,
              expression: value as typeof element.expression,
            })
          }
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>
            {['neutral', 'happy', 'thinking', 'encouraging', 'surprised'].map((value) => (
              <SelectItem key={value} value={value}>{value}</SelectItem>
            ))}
          </SelectGroup></SelectContent>
        </Select>
      </Field>
    )
  }

  if (element.kind === 'pinyinChart') {
    return (
      <>
        <Field>
          <FieldLabel htmlFor="pinyin-highlights">Highlighted keys</FieldLabel>
          <Input
            id="pinyin-highlights"
            value={element.highlightKeys.join(', ')}
            onChange={(event) =>
              onChange({
                ...element,
                highlightKeys: event.target.value.split(',').map((key) => key.trim()).filter(Boolean),
              })
            }
          />
        </Field>
        <AssetSelectField
          label="Chart audio"
          value={element.audioAssetId ?? undefined}
          assets={assets.filter((asset) => asset.kind === 'audio')}
          locale={locale}
          onChange={(audioAssetId) => onChange({ ...element, audioAssetId })}
        />
      </>
    )
  }

  if (element.kind === 'image' || element.kind === 'audio' || element.kind === 'video') {
    return (
      <AssetSelectField
        label={`${element.kind} asset`}
        value={element.assetId}
        assets={assets.filter((asset) => asset.kind === element.kind)}
        locale={locale}
        onChange={(assetId) => onChange({ ...element, assetId })}
      />
    )
  }

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      This element keeps its template-specific data. Use the JSON tab for advanced editing.
    </p>
  )
}

function AssetSelectField({
  label,
  value,
  assets,
  locale,
  onChange,
}: {
  label: string
  value?: string
  assets: MockAsset[]
  locale: string
  onChange: (assetId: string) => void
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        value={value ?? ''}
        onValueChange={(assetId) => assetId && onChange(assetId)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an asset" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {readText(asset.label, locale)} · {asset.status}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {assets.length === 0 ? (
        <FieldDescription>No compatible mock assets are registered.</FieldDescription>
      ) : null}
    </Field>
  )
}
