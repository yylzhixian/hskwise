'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  createTravels,
  Travels,
  type TravelMetadata,
  type TravelsHistory,
} from 'travels'

import {
  CourseStudioProjectSchema,
  type CourseStudioProject,
} from '../scene-schema/project-schema'
import { courseStudioStorageKey, parseStoredProject } from './studio-project'

export type StudioSaveStatus =
  | 'sample'
  | 'restored'
  | 'migrated'
  | 'saving'
  | 'saved'
  | 'error'

export type StudioHistorySource =
  | 'outline'
  | 'inspector'
  | 'timeline'
  | 'assets'
  | 'import'
  | 'system'

type ProjectUpdater = (project: CourseStudioProject) => CourseStudioProject

type CommitOptions = {
  label: string
  source: StudioHistorySource
  mergeKey?: string
}

type StudioDocumentValue = {
  project: CourseStudioProject
  saveStatus: StudioSaveStatus
  canUndo: boolean
  canRedo: boolean
  undoLabel?: string
  redoLabel?: string
  commitProject: (updater: ProjectUpdater, options: CommitOptions) => void
  replaceProject: (
    project: CourseStudioProject,
    options: Pick<CommitOptions, 'label' | 'source'>,
  ) => void
  flushPendingHistory: () => void
  undo: () => void
  redo: () => void
}

const StudioDocumentContext = createContext<StudioDocumentValue | null>(null)
const historyMergeDelayMs = 600

export function CourseStudioProvider({
  initialProject,
  children,
}: {
  initialProject: CourseStudioProject
  children: ReactNode
}) {
  const [travels, setTravels] = useState(() => createStudioTravels(initialProject))
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>('sample')
  const [persistenceReady, setPersistenceReady] = useState(false)
  const archiveTimerRef = useRef<number | null>(null)
  const pendingMergeKeyRef = useRef<string | null>(null)

  const subscribe = useCallback(
    (onStoreChange: () => void) => travels.subscribe(onStoreChange),
    [travels],
  )
  const project = useSyncExternalStore(
    subscribe,
    travels.getState,
    () => initialProject,
  )

  const flushPendingHistory = useCallback(() => {
    if (archiveTimerRef.current !== null) {
      window.clearTimeout(archiveTimerRef.current)
      archiveTimerRef.current = null
    }
    pendingMergeKeyRef.current = null
    if (travels.canArchive()) travels.archive()
  }, [travels])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedHistory = window.localStorage.getItem(
          getCourseStudioHistoryStorageKey(initialProject.id),
        )

        if (storedHistory) {
          const history = Travels.deserialize<CourseStudioProject>(storedHistory, {
            validation: 'semantic',
          })
          const restored = CourseStudioProjectSchema.parse(history.state)
          if (restored.id !== initialProject.id) {
            throw new Error('Stored Course Studio project identity does not match.')
          }
          setTravels(createStudioTravels(restored, history))
          setSaveStatus('restored')
          return
        }

        const legacyProject = window.localStorage.getItem(courseStudioStorageKey)
        if (legacyProject) {
          const result = parseStoredProject(legacyProject)
          if (result.success && result.data.id === initialProject.id) {
            setTravels(createStudioTravels(result.data))
            setSaveStatus('migrated')
          }
        }
      } catch (error) {
        console.error('Course Studio history restore failed.', error)
        setSaveStatus('error')
      } finally {
        setPersistenceReady(true)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [initialProject.id])

  useEffect(() => {
    if (!persistenceReady) return
    let saveTimer: number | null = null

    const save = () => {
      setSaveStatus('saving')
      if (saveTimer !== null) window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => {
        try {
          CourseStudioProjectSchema.parse(travels.getState())
          const snapshot = travels.serialize({ strict: true })
          window.localStorage.setItem(
            getCourseStudioHistoryStorageKey(initialProject.id),
            JSON.stringify(snapshot),
          )
          setSaveStatus('saved')
        } catch (error) {
          console.error('Course Studio history save failed.', error)
          setSaveStatus('error')
        }
      }, 350)
    }

    save()
    const unsubscribe = travels.subscribe(save)
    return () => {
      unsubscribe()
      if (saveTimer !== null) window.clearTimeout(saveTimer)
    }
  }, [initialProject.id, persistenceReady, travels])

  useEffect(
    () => () => {
      if (archiveTimerRef.current !== null) {
        window.clearTimeout(archiveTimerRef.current)
      }
    },
    [],
  )

  const commitProject = useCallback(
    (updater: ProjectUpdater, options: CommitOptions) => {
      const metadata = createMetadata(options)

      if (!options.mergeKey) {
        flushPendingHistory()
        travels.transaction(metadata, () => {
          travels.setState(updater(travels.getState()))
        })
        return
      }

      if (
        pendingMergeKeyRef.current &&
        pendingMergeKeyRef.current !== options.mergeKey
      ) {
        flushPendingHistory()
      }

      travels.setState(updater(travels.getState()), metadata)
      pendingMergeKeyRef.current = options.mergeKey
      if (archiveTimerRef.current !== null) {
        window.clearTimeout(archiveTimerRef.current)
      }
      archiveTimerRef.current = window.setTimeout(() => {
        archiveTimerRef.current = null
        pendingMergeKeyRef.current = null
        if (travels.canArchive()) travels.archive(metadata)
      }, historyMergeDelayMs)
    },
    [flushPendingHistory, travels],
  )

  const replaceProject = useCallback(
    (
      nextProject: CourseStudioProject,
      options: Pick<CommitOptions, 'label' | 'source'>,
    ) => {
      commitProject(() => nextProject, options)
    },
    [commitProject],
  )

  const undo = useCallback(() => {
    flushPendingHistory()
    if (travels.canBack()) travels.back()
  }, [flushPendingHistory, travels])

  const redo = useCallback(() => {
    flushPendingHistory()
    if (travels.canForward()) travels.forward()
  }, [flushPendingHistory, travels])

  const metadata = travels.getMetadata()
  const position = travels.getPosition()
  const value = useMemo<StudioDocumentValue>(
    () => ({
      project,
      saveStatus,
      canUndo: travels.canBack() || travels.canArchive(),
      canRedo: travels.canForward(),
      undoLabel: position > 0 ? metadata[position - 1]?.label : undefined,
      redoLabel: metadata[position]?.label,
      commitProject,
      replaceProject,
      flushPendingHistory,
      undo,
      redo,
    }),
    [
      commitProject,
      flushPendingHistory,
      metadata,
      position,
      project,
      redo,
      replaceProject,
      saveStatus,
      travels,
      undo,
    ],
  )

  return (
    <StudioDocumentContext.Provider value={value}>
      {children}
    </StudioDocumentContext.Provider>
  )
}

export function useCourseStudioDocument() {
  const value = useContext(StudioDocumentContext)
  if (!value) {
    throw new Error('useCourseStudioDocument must be used inside CourseStudioProvider.')
  }
  return value
}

export function getCourseStudioHistoryStorageKey(projectId: string) {
  return `hskwise.course-studio.document.v2:${projectId}`
}

function createStudioTravels(
  project: CourseStudioProject,
  history?: TravelsHistory,
) {
  return createTravels(project, {
    autoArchive: false,
    enableAutoFreeze: true,
    history,
    maxHistory: 100,
    strictInitialPatches: true,
    onBranchDiscard(event) {
      console.debug('Course Studio redo branch discarded.', {
        discardedEntries: event.discarded.length,
        position: event.position,
      })
    },
    onError(error) {
      console.error('Course Studio history operation failed.', error)
    },
  })
}

function createMetadata(options: CommitOptions): TravelMetadata {
  return {
    label: options.label,
    source: options.source,
    timestamp: Date.now(),
  }
}
