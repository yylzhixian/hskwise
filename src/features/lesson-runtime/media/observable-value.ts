export function createObservableValue<T>(initialValue: T) {
  let value = initialValue
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => value,
    set: (nextValue: T) => {
      if (Object.is(value, nextValue)) return
      value = nextValue
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    clear: () => listeners.clear(),
  }
}
