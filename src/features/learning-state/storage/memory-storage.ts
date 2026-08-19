import type { LearningStorageAdapter } from './learning-storage'

type MemoryStorageOptions = {
  initialValue?: string | null
  unavailable?: boolean
}

export function createMemoryStorageAdapter(
  options: MemoryStorageOptions = {},
): LearningStorageAdapter {
  let value = options.initialValue ?? null

  function assertAvailable() {
    if (options.unavailable) throw new Error('Storage unavailable')
  }

  return {
    read() {
      assertAvailable()
      return value
    },
    write(nextValue) {
      assertAvailable()
      value = nextValue
    },
    remove() {
      assertAvailable()
      value = null
    },
  }
}

export type LearningPersistenceRuntime = {
  adapter: LearningStorageAdapter
  enabled: boolean
}

export function createLearningPersistenceRuntime(): LearningPersistenceRuntime {
  return {
    adapter: createMemoryStorageAdapter(),
    enabled: false,
  }
}
