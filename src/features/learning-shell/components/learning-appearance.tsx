'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type LearningAppearance = 'dark' | 'light' | 'system'

type LearningAppearanceContextValue = {
  resolvedAppearance: Exclude<LearningAppearance, 'system'>
  toggleAppearance: () => void
}

const storageKey = 'hskwise.learning-appearance:v1'
const appearanceChangeEvent = 'hskwise:learning-appearance-change'
const darkModeQuery = '(prefers-color-scheme: dark)'
let sessionAppearance: LearningAppearance = 'system'

const LearningAppearanceContext =
  createContext<LearningAppearanceContextValue | null>(null)

function subscribeToSystemAppearance(onChange: () => void) {
  const mediaQuery = window.matchMedia(darkModeQuery)
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

function getSystemAppearance() {
  return window.matchMedia(darkModeQuery).matches
}

function getServerAppearance() {
  return true
}

function readStoredAppearance(): LearningAppearance {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored === 'dark' || stored === 'light' ? stored : 'system'
  } catch {
    return sessionAppearance
  }
}

function subscribeToStoredAppearance(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(appearanceChangeEvent, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(appearanceChangeEvent, onChange)
  }
}

function getServerPreference(): LearningAppearance {
  return 'system'
}

function writeStoredAppearance(appearance: Exclude<LearningAppearance, 'system'>) {
  sessionAppearance = appearance
  try {
    window.localStorage.setItem(storageKey, appearance)
  } catch {
    // The visual preference still applies for the current page session.
  }
  window.dispatchEvent(new Event(appearanceChangeEvent))
}

export function LearningAppearanceRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const systemIsDark = useSyncExternalStore(
    subscribeToSystemAppearance,
    getSystemAppearance,
    getServerAppearance,
  )
  const appearance = useSyncExternalStore(
    subscribeToStoredAppearance,
    readStoredAppearance,
    getServerPreference,
  )

  const resolvedAppearance =
    appearance === 'system' ? (systemIsDark ? 'dark' : 'light') : appearance

  const toggleAppearance = useCallback(() => {
    const nextAppearance = resolvedAppearance === 'dark' ? 'light' : 'dark'
    writeStoredAppearance(nextAppearance)
  }, [resolvedAppearance])

  return (
    <LearningAppearanceContext.Provider
      value={{ resolvedAppearance, toggleAppearance }}
    >
      <TooltipProvider>
        <div
          className={cn(
            'learning-theme',
            resolvedAppearance === 'dark' && 'dark',
            className,
          )}
        >
          {children}
        </div>
      </TooltipProvider>
    </LearningAppearanceContext.Provider>
  )
}

export function LearningAppearanceToggle() {
  const appearance = useContext(LearningAppearanceContext)

  if (!appearance) return null

  const isDark = appearance.resolvedAppearance === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
  const Icon = isDark ? MoonIcon : SunIcon

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={appearance.toggleAppearance}
            size="icon-lg"
            variant="ghost"
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
